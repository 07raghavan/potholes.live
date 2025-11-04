export type PotholeReport = {
  id: string;
  lat: number;
  lon: number;
  ts: number; // epoch ms
  // Optional metadata
  uid?: string; // anonymous user/session id
  model?: string;
  conf?: number;
};

export type Unsubscribe = () => void;

export interface ReportStore {
  addReport(rep: PotholeReport): Promise<void>;
  addBatch(reps: PotholeReport[]): Promise<void>;
  // Subscribe to reports within bbox or radius
  subscribeNearby(
    center: { lat: number; lon: number },
    radiusMeters: number,
    cb: (reports: PotholeReport[]) => void
  ): Unsubscribe;
  // Subscribe to reports for a specific user (optimized for Profile page)
  subscribeByUser?(
    userId: string,
    cb: (reports: PotholeReport[]) => void
  ): Unsubscribe;
}

// In-memory store for development and offline mode
export class InMemoryReportStore implements ReportStore {
  private reports: PotholeReport[] = [];
  private listeners = new Set<() => void>();

  async addReport(rep: PotholeReport): Promise<void> {
    this.reports.push(rep);
    this.emit();
  }
  async addBatch(reps: PotholeReport[]): Promise<void> {
    if (reps.length === 0) return;
    this.reports.push(...reps);
    this.emit();
  }

  subscribeNearby(
    center: { lat: number; lon: number },
    radiusMeters: number,
    cb: (reports: PotholeReport[]) => void
  ): Unsubscribe {
    const wrapped = () => cb(this.filterNearby(center, radiusMeters));
    this.listeners.add(wrapped);
    // Fire once immediately
    wrapped();
    return () => {
      this.listeners.delete(wrapped);
    };
  }

  subscribeByUser(
    userId: string,
    cb: (reports: PotholeReport[]) => void
  ): Unsubscribe {
    const wrapped = () => cb(this.reports.filter(r => r.uid === userId));
    this.listeners.add(wrapped);
    // Fire once immediately
    wrapped();
    return () => {
      this.listeners.delete(wrapped);
    };
  }

  private emit() {
    for (const l of this.listeners) l();
  }

  private filterNearby(center: { lat: number; lon: number }, radiusMeters: number) {
    // Quick filter: naive haversine; fine for small collections
    const R = 6371_000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const clat = toRad(center.lat);
    const clon = toRad(center.lon);
    return this.reports.filter((r) => {
      const dLat = toRad(r.lat) - clat;
      const dLon = toRad(r.lon) - clon;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(clat) * Math.cos(toRad(r.lat)) * Math.sin(dLon / 2) ** 2;
      const d = 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
      return d <= radiusMeters;
    });
  }
}

// Firestore-backed implementation (requires env + firebase)
export class FirestoreReportStore implements ReportStore {
  private db: any;
  private unsubscribers = new Set<() => void>();
  constructor(db: any) {
    this.db = db;
  }
  async addReport(rep: PotholeReport): Promise<void> {
    // Check for duplicates within 10m radius (prevents duplicate submissions)
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    // Calculate rough bounding box (1 degree ≈ 111km)
    const latRange = 0.0001; // ~10m
    const lonRange = 0.0001;
    
    const q = query(
      collection(this.db, 'potholeReports'),
      where('lat', '>=', rep.lat - latRange),
      where('lat', '<=', rep.lat + latRange)
    );
    
    const snapshot = await getDocs(q);
    
    // Check if any existing pothole is within 10m
    for (const doc of snapshot.docs) {
      const existing = doc.data();
      const distance = this.calculateDistance(
        rep.lat, rep.lon,
        existing.lat, existing.lon
      );
      
      if (distance < 10) {
        console.log('[ReportStore] ⚠️ Duplicate pothole within 10m - skipping', {
          new: `${rep.lat.toFixed(6)}, ${rep.lon.toFixed(6)}`,
          existing: `${existing.lat?.toFixed(6)}, ${existing.lon?.toFixed(6)}`,
          distance: distance.toFixed(1) + 'm'
        });
        return; // Skip duplicate
      }
    }
    
    // No duplicates found - add new pothole
    const { addDoc } = await import('firebase/firestore');
    await addDoc(collection(this.db, 'potholeReports'), rep);
    console.log('[ReportStore] ✅ Added new pothole:', rep.lat.toFixed(6), rep.lon.toFixed(6));
  }
  
  // Haversine distance calculation
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  async addBatch(reps: PotholeReport[]): Promise<void> {
    if (reps.length === 0) return;
    const { writeBatch, collection, doc } = await import('firebase/firestore');
    const batch = writeBatch(this.db);
    const col = collection(this.db, 'potholeReports');
    for (const r of reps) {
      const ref = doc(col);
      batch.set(ref, r);
    }
    await batch.commit();
  }
  subscribeNearby(
    center: { lat: number; lon: number },
    radiusMeters: number,
    cb: (reports: PotholeReport[]) => void
  ): Unsubscribe {
    let stopped = false;
    const setup = async () => {
      const { collection, query, orderBy, onSnapshot, limit } = await import('firebase/firestore');
      // Query ALL potholes - no time or distance filters
      const q = query(
        collection(this.db, 'potholeReports'),
        orderBy('ts', 'desc'),
        limit(5000) // Increased limit to show more potholes
      );
      const unsub = onSnapshot(q, (snap) => {
        if (stopped) return;
        const all: PotholeReport[] = [];
        snap.forEach((doc) => {
          const d = doc.data() as any;
          if (typeof d.lat === 'number' && typeof d.lon === 'number' && typeof d.ts === 'number') {
            all.push({ id: doc.id, lat: d.lat, lon: d.lon, ts: d.ts, uid: d.uid, model: d.model, conf: d.conf });
          }
        });
        // Return ALL potholes - no filtering
        console.log('[ReportStore] 📍 Loaded', all.length, 'potholes from Firebase (no filters)');
        cb(all);
      });
      this.unsubscribers.add(unsub);
    };
    setup();
    return () => {
      stopped = true;
      for (const u of this.unsubscribers) u();
      this.unsubscribers.clear();
    };
  }

  subscribeByUser(
    userId: string,
    cb: (reports: PotholeReport[]) => void
  ): Unsubscribe {
    let stopped = false;
    const setup = async () => {
      const { collection, query, where, orderBy, onSnapshot, limit } = await import('firebase/firestore');
      // Optimized query: filter by uid server-side, only last 50 reports
      const q = query(
        collection(this.db, 'potholeReports'),
        where('uid', '==', userId),
        orderBy('ts', 'desc'),
        limit(50)
      );
      const unsub = onSnapshot(q, (snap) => {
        if (stopped) return;
        const reports: PotholeReport[] = [];
        snap.forEach((doc) => {
          const d = doc.data() as any;
          if (typeof d.lat === 'number' && typeof d.lon === 'number' && typeof d.ts === 'number') {
            reports.push({ id: doc.id, lat: d.lat, lon: d.lon, ts: d.ts, uid: d.uid, model: d.model, conf: d.conf });
          }
        });
        cb(reports);
      });
      this.unsubscribers.add(unsub);
    };
    setup();
    return () => {
      stopped = true;
      for (const u of this.unsubscribers) u();
      this.unsubscribers.clear();
    };
  }
}

export async function getReportStore(): Promise<ReportStore> {
  const { getDb } = await import('./firebase');
  const db = await getDb();
  if (db) return new FirestoreReportStore(db);
  return new InMemoryReportStore();
}
