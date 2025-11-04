// Generate a shareable image of a static map with session pothole points and overlay summary text

type Point = { lat: number; lon: number };

// Map image generation is proxied via Netlify Function to hide API token.
const STYLE = 'mapbox/navigation-night-v1';
const FALLBACK_PIN_URL = 'https://potholes.live/icon-192.png';

let cachedPinUrl: string | null = null;

function getPinUrl() {
  if (cachedPinUrl) return cachedPinUrl;
  const envUrl = import.meta.env.VITE_SHARE_PIN_URL as string | undefined;
  if (envUrl) {
    cachedPinUrl = envUrl;
    return cachedPinUrl;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    cachedPinUrl = `${window.location.origin}/icon-192.png`;
    return cachedPinUrl;
  }
  cachedPinUrl = FALLBACK_PIN_URL;
  return cachedPinUrl;
}

function toPinOverlay(points: Point[]) {
  if (!points.length) return '';
  const encodedIcon = encodeURIComponent(getPinUrl());
  return points
    .map((p) => `url-${encodedIcon}(${p.lon.toFixed(6)},${p.lat.toFixed(6)})`)
    .join(',');
}

function toPathOverlay(points: Point[]) {
  // Create blue path line showing travel route
  // Mapbox Static API path format: path-{strokeWidth}+{strokeColor}-{strokeOpacity}({coordinates})
  // Coordinates format: lon1,lat1,lon2,lat2,...
  if (points.length < 2) return '';
  
  const coords = points.map(p => `${p.lon.toFixed(6)},${p.lat.toFixed(6)}`).join(',');
  // Blue path: width=5, color=#2196F3 (blue), opacity=0.8
  return `path-5+2196F3-0.8(${coords})`;
}

function calculateBounds(points: Point[]): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  if (points.length === 0) {
    return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
  }
  
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLon = points[0].lon;
  let maxLon = points[0].lon;
  
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }
  
  return { minLat, maxLat, minLon, maxLon };
}

function latToMercator(lat: number) {
  const clamped = Math.max(Math.min(lat, 85), -85);
  const rad = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

function calculateAdaptiveZoom(points: Point[], mapWidth: number, mapHeight: number) {
  if (points.length <= 1) {
    return 16.5;
  }

  const bounds = calculateBounds(points);
  const paddingFactor = 1.25;
  const tileSize = 512;

  const latFraction = Math.max(
    (latToMercator(bounds.maxLat) - latToMercator(bounds.minLat)) / (2 * Math.PI),
    0.00001
  ) * paddingFactor;
  const lonFraction = Math.max(bounds.maxLon - bounds.minLon, 0.00001) / 360 * paddingFactor;

  const latZoom = Math.log2(mapHeight / tileSize / latFraction);
  const lonZoom = Math.log2(mapWidth / tileSize / lonFraction);
  let zoom = Math.min(latZoom, lonZoom);

  if (points.length <= 3) {
    zoom = Math.min(zoom + 0.8, 17);
  } else if (points.length >= 20) {
    zoom = Math.max(zoom - 1.2, 9);
  } else if (points.length >= 10) {
    zoom = Math.max(zoom - 0.6, 9.5);
  }

  return Math.max(9, Math.min(17, zoom));
}

export async function generateSessionShareImage(points: Point[], opts?: { width?: number; height?: number; title?: string; subtitle?: string; stats?: { distance?: number; speed?: number } }) {
  // Instagram Story format: 1080x1920
  const width = opts?.width ?? 1080;
  const height = opts?.height ?? 1920;
  
  // Create overlays: blue path + red pins
  const pathOverlay = points.length > 1 ? toPathOverlay(points) : '';
  const pins = points.length > 0 ? toPinOverlay(points) : '';
  
  // Build overlay string: path first (underneath), then pins on top
  let overlay = '';
  if (pathOverlay) overlay += pathOverlay + ',';
  if (pins) overlay += pins + ',';
  if (overlay.endsWith(',')) overlay = overlay.slice(0, -1);
  overlay = overlay ? `${overlay}/` : '';
  
  // Calculate bounds and add padding for better context (zoom out more)
  let center;
  let zoom = 10; // default zoom
  const mapWidth = width;
  const mapHeight = Math.floor(height * 0.55); // 55% for map

  if (points.length > 0) {
    const bounds = calculateBounds(points);
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLon = (bounds.minLon + bounds.maxLon) / 2;
    zoom = calculateAdaptiveZoom(points, mapWidth, mapHeight);
    center = `${centerLon.toFixed(6)},${centerLat.toFixed(6)},${zoom.toFixed(2)}`;
  } else {
    center = '77.5946,12.9716,10'; // default to Bengaluru if no points
  }
  
  // Call Netlify Function to fetch static map (token kept server-side)
  const fnUrl = '/.netlify/functions/share-map';
  console.log('[Share] Requesting map via function with', points.length, 'points');
  const res = await fetch(fnUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      points,
      width,
      height,
      style: STYLE,
      pinUrl: getPinUrl(),
      center: undefined // allow server to compute
    })
  });
  if (!res.ok) throw new Error(`Static map fetch failed: ${res.status}`);
  const blob = await res.blob();
  const imgBitmap = await createImageBitmap(blob);

  // Compose final image with top stats and bottom branding
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a'); // dark blue
  gradient.addColorStop(0.3, '#1e293b');
  gradient.addColorStop(0.7, '#1e293b');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw map in middle
  const mapY = Math.floor(height * 0.25);
  ctx.drawImage(imgBitmap, 0, mapY, mapWidth, mapHeight);

  // Top stats section - More prominent display
  const title = opts?.title ?? 'Potholes.live';
  const subtitle = opts?.subtitle ?? '';
  const count = points.length;

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  
  // Title at top
  ctx.font = 'bold 56px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.fillStyle = '#8aff7a';
  ctx.fillText(title, width / 2, 100);
  
  // Big count
  ctx.font = 'bold 200px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.fillStyle = '#ff4444';
  ctx.fillText(`${count}`, width / 2, 280);
  
  // "potholes mapped" text
  ctx.font = '600 52px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`pothole${count === 1 ? '' : 's'} mapped`, width / 2, 350);

  // Location if available
  if (subtitle) {
    ctx.font = '500 40px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Location: ${subtitle}`, width / 2, 410);
  }

  // Bottom section with stats - improved layout
  const bottomY = mapY + mapHeight + 80;
  
  // Stats in a nice grid
  const stats = opts?.stats;
  if (stats) {
    ctx.textAlign = 'center';
    
    // Distance stat
    if (stats.distance !== undefined && stats.distance > 0) {
      const leftX = width / 2;
      ctx.fillStyle = '#8aff7a';
      ctx.font = 'bold 72px system-ui';
      ctx.fillText(`${(stats.distance / 1000).toFixed(2)}`, leftX, bottomY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 40px system-ui';
      ctx.fillText('KM TRAVELED', leftX, bottomY + 55);
    }
  }

  // Branding and call to action at bottom
  ctx.textAlign = 'center';
  ctx.font = '600 42px system-ui';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Help fix our roads!', width / 2, height - 140);
  
  ctx.font = '500 36px system-ui';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Join the community at potholes.live', width / 2, height - 80);

  const composedBlob = await canvas.convertToBlob({ type: 'image/png', quality: 0.95 });
  return composedBlob;
}

function roundRect(ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<string | null> {
  try {
    const url = `/.netlify/functions/geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      console.error(`Reverse geocode failed: ${res.status} for ${lat},${lon}`);
      return null;
    }
    const json = await res.json();
    const feat = json?.features?.[0];
    if (!feat) return null;
    return feat.place_name as string;
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Reverse geocode error:', error);
    }
    return null;
  }
}
