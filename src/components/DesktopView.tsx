import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Smartphone, X, Menu } from 'lucide-react';
import { useState } from 'react';

interface DesktopViewProps {
  onClose: () => void;
}

const DesktopView = ({ onClose }: DesktopViewProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto scroll-smooth">
      {/* Header */}
      <div className="border-b-4 border-foreground px-6 py-4 flex justify-between items-center sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <img src="/icon-192.png" alt="Pothole Icon" className="w-10 h-10" />
          <h2 className="text-3xl font-bold uppercase">
            Potholes<span className="text-primary">.live</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <X className="w-7 h-7" />
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-background border-l-4 border-foreground z-50 p-6"
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
              <button
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left text-xl font-bold uppercase py-3 px-4 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-transparent hover:border-foreground"
              >
                About
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

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Side - Mobile Prompt & QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border-4 border-foreground rounded-3xl p-8 chunky-shadow-lg"
          >
            <div className="text-center space-y-6">
              <Smartphone className="w-20 h-20 mx-auto text-primary animate-pulse" />
              
              <h3 className="text-3xl font-black uppercase">Use Your Mobile Device</h3>
              
              <p className="text-lg text-muted-foreground">
                Pothole detection requires camera access and GPS, which work best on mobile devices.
              </p>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-2xl border-4 border-foreground inline-block">
                <img 
                  src="/qr-code.png" 
                  alt="Scan to open on mobile" 
                  className="w-[200px] h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <p className="font-bold text-lg">Scan this QR code on your phone</p>
                <p className="text-sm text-muted-foreground">
                  Or visit: <span className="font-mono font-bold text-primary">potholes.live</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-background border-4 border-foreground rounded-3xl p-8 chunky-shadow-lg">
              <h3 className="text-2xl font-black uppercase mb-4">About Potholes.live</h3>
              
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg text-foreground">
                  Potholes.live is a community-driven platform that uses AI-powered detection to map potholes in real-time, directly from your mobile camera.
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-primary/10 border-4 border-foreground rounded-3xl p-6 chunky-shadow">
              <h4 className="font-bold text-lg mb-4 text-center">Connect With Me</h4>
              <div className="flex gap-3 justify-center">
                <a 
                  href="https://github.com/07raghavan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-lg border-4 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors chunky-shadow"
                  title="GitHub"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/07raghavan/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-lg border-4 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors chunky-shadow"
                  title="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://x.com/007_raghavan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-lg border-4 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors chunky-shadow"
                  title="X (Twitter)"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/the.raghavan/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-lg border-4 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors chunky-shadow"
                  title="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-destructive text-destructive-foreground border-4 border-foreground rounded-3xl p-6 chunky-shadow text-center">
              <h4 className="font-bold text-xl mb-2">Ready to Help Fix Roads?</h4>
              <p className="mb-4">Scan the QR code with your phone to start detecting potholes!</p>
              <p className="text-sm mb-4 opacity-90">On browser, you can view the potholes mapped by others</p>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={onClose}
                className="font-bold"
              >
                View Pothole Map
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DesktopView;
