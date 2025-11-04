import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from '@/lib/auth';
import { createOrUpdateUserProfile } from '@/lib/user-service';

interface AuthContextType {
  user: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    
    (async () => {
      // Listen for auth state changes once on mount
      unsub = await onAuthStateChanged((u) => {
        setUser(u);
        setLoading(false);
        
        // Create/update user profile in Firestore
        if (u) {
          createOrUpdateUserProfile(u).catch(err => {
            console.error('[AuthContext] Profile creation failed:', err);
          });
        }
      });
    })();
    
    return () => {
      if (unsub) unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
