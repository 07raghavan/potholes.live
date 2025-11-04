import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: '⚠️ Missing fields', description: 'Please enter email and password', variant: 'destructive' });
      return;
    }

    // Validate password confirmation for signup
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        toast({ title: '⚠️ Password mismatch', description: 'Passwords do not match', variant: 'destructive' });
        return;
      }
      if (password.length < 6) {
        toast({ title: '⚠️ Weak password', description: 'Password must be at least 6 characters', variant: 'destructive' });
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        toast({ title: '✅ Account created!', description: 'Welcome to potholes.live' });
        onClose();
      } else {
        await signInWithEmail(email, password);
        toast({ title: '👋 Welcome back!', description: 'Signed in successfully' });
        onClose();
      }
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('[Auth] Error:', err);
      
      // Parse Firebase error codes
      let errorMsg = 'Authentication failed';
      if (err?.code === 'auth/email-already-in-use') {
        errorMsg = 'Email already registered. Try signing in instead.';
      } else if (err?.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (err?.code === 'auth/weak-password') {
        errorMsg = 'Password too weak. Use at least 6 characters.';
      } else if (err?.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email.';
      } else if (err?.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (err?.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please try again later.';
      } else if (err?.code === 'auth/network-request-failed') {
        errorMsg = 'Network error. Check your internet connection.';
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      toast({ title: '❌ Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center portrait:px-4 landscape:px-2 z-50 pointer-events-none overflow-y-auto landscape:py-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full portrait:max-w-md landscape:max-w-2xl landscape:max-h-[90vh] bg-background border-4 border-foreground rounded-3xl chunky-shadow-lg portrait:p-6 landscape:p-4 pointer-events-auto landscape:flex landscape:flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center portrait:mb-6 landscape:mb-3">
                <h2 className="portrait:text-2xl landscape:text-xl font-bold uppercase">Authentication</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="landscape:w-8 landscape:h-8">
                  <X className="landscape:w-5 landscape:h-5" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 portrait:mb-6 landscape:mb-3 bg-muted p-1 rounded-xl border-2 border-foreground landscape:flex-shrink-0">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 portrait:py-2 landscape:py-1 px-4 rounded-lg font-bold uppercase portrait:text-sm landscape:text-xs transition-all ${
                    mode === 'login' 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 portrait:py-2 landscape:py-1 px-4 rounded-lg font-bold uppercase portrait:text-sm landscape:text-xs transition-all ${
                    mode === 'signup' 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="portrait:space-y-4 landscape:space-y-2 landscape:overflow-y-auto landscape:flex-1">
                <div>
                  <label className="block portrait:text-sm landscape:text-xs font-bold portrait:mb-2 landscape:mb-1 uppercase">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full portrait:px-4 portrait:py-3 landscape:px-3 landscape:py-2 border-4 border-foreground rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary portrait:text-base landscape:text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block portrait:text-sm landscape:text-xs font-bold portrait:mb-2 landscape:mb-1 uppercase">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full portrait:px-4 portrait:py-3 landscape:px-3 landscape:py-2 border-4 border-foreground rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary portrait:text-base landscape:text-sm"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block portrait:text-sm landscape:text-xs font-bold portrait:mb-2 landscape:mb-1 uppercase">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full portrait:px-4 portrait:py-3 landscape:px-3 landscape:py-2 border-4 border-foreground rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary portrait:text-base landscape:text-sm"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full portrait:text-lg landscape:text-sm font-bold uppercase landscape:py-2 landscape:h-auto landscape:mt-2"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              {/* Sign-in vs Sign-up note */}
              <p className="portrait:text-xs landscape:text-[10px] text-center portrait:mt-4 landscape:mt-2 landscape:flex-shrink-0 text-muted-foreground">
                {mode === 'signup' ? 'Already have an account? Switch to Sign In above.' : 'New here? Switch to Register above to create an account.'}
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
