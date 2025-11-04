import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl h-[90vh] pointer-events-auto"
            >
              <div className="bg-background border-4 border-foreground rounded-3xl chunky-shadow-lg h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b-4 border-foreground">
                  <div className="flex items-center gap-4">
                    <img src="/icon-192.png" alt="Potholes.live" className="w-12 h-12" />
                    <div>
                      <h2 className="text-2xl font-bold uppercase">Introducing potholes.live</h2>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <X size={24} strokeWidth={3} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Main intro */}
                  <div className="space-y-4">
                    <p className="text-lg font-bold">
                      potholes.live — so simple, even a pothole could figure it out
                    </p>
                    
                    <p>
                      When you're <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">driving, cycling, or walking</span> — just open the site, enable location and camera access, and the AI model will <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">instantly start detecting and mapping potholes</span> around you.
                    </p>

                    <p>
                      You can then share the mapped data and stats on social media, putting <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">real pressure on local governments to take action</span>.
                    </p>
                  </div>

                  {/* Read More Button */}
                  {!showMore && (
                    <button
                      onClick={() => setShowMore(true)}
                      className="w-full py-3 px-6 bg-foreground text-background font-bold uppercase rounded-xl hover:bg-foreground/90 transition-colors"
                    >
                      Read More
                    </button>
                  )}

                  {/* Extended Content */}
                  <AnimatePresence>
                    {showMore && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                      >
                      {/* The Harsh Reality */}
                      <div className="space-y-4 border-t-4 border-foreground pt-6">
                        <h3 className="text-xl font-bold uppercase">The Harsh Reality of Indian Roads</h3>
                        
                        <p>
                          Between 2018 and 2020, <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded font-bold">over 5,626 lives were lost</span> in India due to pothole-related accidents.
                          In 2023 alone, potholes claimed another <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded font-bold">2,161 lives</span> — and this number continues to rise every year.
                        </p>

                        <p>
                          India spends over <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">₹3 lakh crore annually</span> on road construction and maintenance. Yet, poor quality control, delayed repairs, and underutilized budgets turn our streets into death traps.
                        </p>

                        <p className="font-bold">
                          Despite repeated incidents, authorities often deny or downplay the problem instead of addressing it head-on.
                        </p>
                      </div>

                      {/* Why I Built This */}
                      <div className="space-y-4 border-t-4 border-foreground pt-6">
                        <h3 className="text-xl font-bold uppercase">Why I Built potholes.live</h3>
                        
                        <p>
                          The idea sparked while watching <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">Caleb Friesen</span> (Known for <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">Backstage with Millionaires</span>), one of my favorite content creators on entrepreneurship and Bangalore's startup scene.
                          He rode the <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">Ultraviolette F77</span>, my dream bike (thats where i got hooked to reel), he counted the number of potholes on some Bangalore road.
                        </p>

                        <p>
                          On another day, I came across a video where he showcased a <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">pothole detection model</span> someone posted on X. Around the same time, I saw other content creators and as well <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">Kiran Mazumdar-Shaw</span> and <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">Mohandas Pai</span> questioning Bengaluru's poor infrastructure. Politicians claimed there were only <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">10,000 potholes</span> in Bangalore — a statement that rightly drew criticism.
                        </p>

                        <p className="font-bold">
                          That's when I thought:<br />
                          "What if we could actually map potholes in real time, city by city?"
                        </p>

                        <p>
                          This project is <span className="bg-primary text-primary-foreground px-2 py-1 rounded font-bold">fully open-source</span> — meaning anyone can contribute, improve, or build upon it. This is just a wild idea .. I don't know how much it will be of real use.
                        </p>

                        <p className="font-bold text-center pt-4 border-t-2 border-foreground">
                          Thanks for reading till the end,<br />
                          <span className="text-primary">Raghav R.</span>
                        </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t-4 border-foreground">
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 bg-primary text-primary-foreground font-bold uppercase rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Let's Get Started! 🚀
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
