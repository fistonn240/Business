import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signIn, logOut, db } from '../firebase';
import { LogIn, LogOut, User as UserIcon, Loader2, ShieldCheck, Target, Sparkles, Zap } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user to Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Initializing Ascend...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        {/* Left Side: Branding & Features */}
        <div className="lg:w-1/2 bg-indigo-900 p-12 flex flex-col justify-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-950/50">
                <Target className="text-indigo-900 w-8 h-8" />
              </div>
              <span className="font-bold text-3xl tracking-tight">Ascend</span>
            </div>
            
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Master Your <span className="text-indigo-400">Business</span> & <span className="text-emerald-400">Life</span> Strategy.
            </h1>
            <p className="text-indigo-100 text-xl mb-12 leading-relaxed">
              The all-in-one achievement system powered by AI to help you strategically reach your highest potential.
            </p>

            <div className="space-y-6">
              {[
                { icon: Zap, text: "AI-Powered Business Coaching", color: "text-amber-400" },
                { icon: ShieldCheck, text: "Secure Strategic Canvas", color: "text-emerald-400" },
                { icon: Sparkles, text: "Real-time Goal Tracking", color: "text-indigo-300" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="font-medium text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -left-24 -top-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <UserIcon className="text-slate-300 w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome Back</h2>
            <p className="text-slate-500 mb-10">Sign in to your account to continue your strategic journey.</p>
            
            <button 
              onClick={signIn}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <LogIn className="w-6 h-6" />
              Sign in with Google
            </button>

            <div className="mt-12 pt-12 border-t border-slate-50">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">Trusted by Strategic Leaders</p>
              <div className="flex justify-center gap-8 opacity-30 grayscale">
                <div className="w-8 h-8 bg-slate-400 rounded-full" />
                <div className="w-8 h-8 bg-slate-400 rounded-full" />
                <div className="w-8 h-8 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut: logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
