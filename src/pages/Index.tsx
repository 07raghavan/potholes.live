import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Globe from '@/components/Globe';
import CameraTray from '@/components/CameraTray';
import WelcomeModal from '@/components/WelcomeModal';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { ChevronUp, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReportStore, type PotholeReport } from '@/lib/reportStore';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface PotholeMarker {
  id: string;
  lat: number;
  lng: number;
  timestamp: Date;
}

const Index = () => {
  const { user } = useAuth();
  const [isCameraTrayOpen, setIsCameraTrayOpen] = useState(false);
  const [potholes, setPotholes] = useState<PotholeMarker[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [storeReady, setStoreReady] = useState(false);
  const [userCenter, setUserCenter] = useState<{lat:number; lng:number} | null>(null);
  const [currentGpsPosition, setCurrentGpsPosition] = useState<{lat: number; lng: number; accuracy: number} | null>(null); // New: GPS from Globe
  const [isDesktop, setIsDesktop] = useState(false);
  const swipeStartYRef = useRef<number | null>(null);
  
  // Debug: Log GPS updates
  useEffect(() => {
    if (currentGpsPosition) {
      // ...removed console.log for production...
    }
  }, [currentGpsPosition]);
  
  const storeRef = (window as any).__reportStoreRef || { current: null as any };
  ;(window as any).__reportStoreRef = storeRef;

  // Detect if device is desktop
  useEffect(() => {
    const checkIfDesktop = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isLargeScreen = window.innerWidth >= 1024;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const desktop = isLargeScreen && (!hasTouch || !isMobileUA);
      setIsDesktop(desktop);
    };

    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  useEffect(() => {
    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
    // Init report store
    (async () => {
      if (!storeRef.current) {
        storeRef.current = await getReportStore();
      }
      setStoreReady(true);
    })();
    // Get a center once for nearby subscription
    let mounted = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mounted) setUserCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          if (mounted) setUserCenter({ lat: 20.5937, lng: 78.9629 }); // India center fallback
        }
      );
    } else {
      setUserCenter({ lat: 20.5937, lng: 78.9629 });
    }
    
    return () => { mounted = false; };
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };
  
  const handlePotholeDetected = (location: { lat: number; lng: number }) => {
    const newPothole: PotholeMarker = {
      id: `pothole-${Date.now()}-${Math.random()}`,
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date(),
    };
    setPotholes(prev => [...prev, newPothole]);
    // Always use authenticated user ID from Supabase Auth
    const userId = user?.id || null;
    const rep: PotholeReport = {
      id: newPothole.id,
      lat: newPothole.lat,
      lon: newPothole.lng,
      ts: newPothole.timestamp.getTime(),
      user_id: userId
    };
    if (storeRef.current && typeof storeRef.current.addReport === 'function') {
      storeRef.current.addReport(rep).catch(() => {});
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      toast({ title: '👋 Signed out', description: 'See you next time!' });
    } catch (err: any) {
      toast({ title: '❌ Error', description: err?.message || 'Failed to sign out', variant: 'destructive' });
    }
  };

  // Handle camera open - require authentication first
  const handleCameraOpen = () => {
    if (!user) {
      // Not authenticated - show auth modal
      // ...removed console.log for production...
      setAuthModalMode('signup');
      setAuthModalOpen(true);
      toast({ 
        title: '🔒 Sign in required', 
        description: 'Please sign in or create an account to detect potholes',
        duration: 3000
      });
      return;
    }
    
    // Authenticated - open camera
    // ...removed console.log for production...
    setIsCameraTrayOpen(true);
  };

  // Subscribe to nearby reports so all users see new ones instantly
  useEffect(() => {
    if (!storeReady || !userCenter || !storeRef.current) return;
    
    let unsub: (() => void) | null = null;
    let mounted = true;
    
    try {
      unsub = storeRef.current.subscribeNearby(
        { lat: userCenter.lat, lon: userCenter.lng }, 
        15_000, 
        (reports: PotholeReport[]) => {
          if (!mounted) return; // Don't update if unmounted
          
          // Merge with local state, prefer Firestore IDs
          const mapped: PotholeMarker[] = reports.map(r => ({ 
            id: r.id, 
            lat: r.lat, 
            lng: r.lon, 
            timestamp: new Date(r.ts) 
          }));
          setPotholes(prev => {
            // Merge by id (basic)
            const map = new Map(prev.map(p => [p.id, p] as const));
            for (const m of mapped) map.set(m.id, m);
            return Array.from(map.values());
          });
        }
      );
    } catch (error) {
      // ...removed console.error for production...
    }
    
    return () => {
      mounted = false;
      if (unsub) {
        try {
          unsub();
        } catch (error) {
          // ...removed console.error for production...
        }
      }
    };
  }, [storeReady, userCenter]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Welcome Modal */}
      <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseWelcome} />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/icon-192.png" alt="Pothole Icon" className="w-8 h-8 md:w-10 md:h-10" />
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Potholes<span className="text-primary">.live</span>
          </h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-80 bg-background border-l-4 border-foreground z-50 p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold uppercase">Menu</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <X />
                </Button>
              </div>

              <nav className="space-y-4">
                {/* Auth-conditional navigation */}
                {!user ? (
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-xl font-bold uppercase py-3 px-4 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-transparent hover:border-foreground"
                  >
                    🔐 Sign In / Register
                  </button>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left text-xl font-bold uppercase py-3 px-4 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-transparent hover:border-foreground"
                    >
                      👤 Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left text-xl font-bold uppercase py-3 px-4 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-transparent hover:border-foreground"
                    >
                      🚪 Sign Out
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowWelcomeModal(true);
                  }}
                  className="block w-full text-left text-xl font-bold uppercase py-3 px-4 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-transparent hover:border-foreground"
                >
                  ℹ️ About
                </button>
              </nav>

              {/* Footer */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="border-t-2 border-foreground pt-4">
                  <p className="text-sm opacity-70 mb-3 flex items-center justify-center gap-2">
                    Made with 💚 for <img src="/icon-192.png" alt="Pothole" className="w-4 h-4" /> by Raghav R.
                  </p>
                  
                  {/* Social Links */}
                  <div className="flex gap-3 justify-center">
                    <a 
                      href="https://github.com/07raghavan" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/07raghavan/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://x.com/007_raghavan" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.instagram.com/the.raghavan/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Globe - Full Screen */}
      <div className="absolute inset-0">
        <Globe 
          potholes={potholes} 
          onGpsUpdate={setCurrentGpsPosition} 
        />
      </div>



      {/* Swipe Up Handle - Bottom Center - Always visible */}
      <AnimatePresence>
        {!isCameraTrayOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-30"
          >
            <motion.div 
              {...(!isDesktop ? {
                drag: 'y' as const,
                dragConstraints: { top: -30, bottom: 0 },
                dragElastic: 0.5,
                dragMomentum: false,
                onDragEnd: (_: any, info: any) => {
                  if (info.offset.y < -20) {
                    handleCameraOpen();
                  }
                }
              } : {})}
              onPointerDown={(e) => {
                if (isDesktop) swipeStartYRef.current = (e as any).clientY ?? 0;
              }}
              onPointerUp={(e) => {
                if (isDesktop && swipeStartYRef.current !== null) {
                  const endY = (e as any).clientY ?? 0;
                  if (swipeStartYRef.current - endY > 20) {
                    handleCameraOpen();
                  }
                  swipeStartYRef.current = null;
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleCameraOpen();
              }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="mx-auto w-full max-w-md cursor-pointer hover:shadow-2xl transition-shadow"
            >
              {/* Bottom bar with integrated swipe indicator */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCameraOpen();
                }}
                className="bg-background border-t-4 border-foreground rounded-t-3xl pt-3 pb-6 px-6 text-center chunky-shadow-lg select-none hover:bg-primary/5 transition-colors cursor-pointer"
              >
                {/* Swipe Indicator */}
                <div className="w-12 h-1.5 bg-muted-foreground rounded-full mb-2 mx-auto opacity-50" />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="mb-2"
                >
                  <ChevronUp size={24} className="text-primary mx-auto" strokeWidth={3} />
                </motion.div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-lg font-bold uppercase tracking-tight">
                    {isDesktop ? 'Click to start' : 'Swipe up to start'}
                  </p>
                  <img src="/icon-192.png" alt="Pothole" className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Tray - Full Screen */}
      <CameraTray
        isOpen={isCameraTrayOpen}
        onClose={() => setIsCameraTrayOpen(false)}
        onPotholeDetected={handlePotholeDetected}
        gpsPosition={currentGpsPosition}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </div>
  );
};

export default Index;
