import React from 'react';
import { useAuth } from './AuthProvider';
import { User, Mail, Calendar, Shield, Camera, LogOut, Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Profile() {
  const { user, signOut } = useAuth();

  const deleteAccount = async () => {
    if (!user) return;
    const confirm = window.confirm("Are you absolutely sure? This will delete your profile data. Your goals and strategies will remain but won't be accessible without this account.");
    if (confirm) {
      try {
        await deleteDoc(doc(db, 'users', user.uid));
        // Note: This only deletes the Firestore profile, not the Auth user.
        // For a real app, you'd use a cloud function or admin SDK to delete the Auth user.
        signOut();
      } catch (error) {
        console.error("Error deleting profile:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and account preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-indigo-600" />
            <div className="px-6 pb-8 -mt-12 text-center">
              <div className="relative inline-block">
                <img 
                  src={user?.photoURL || ''} 
                  alt={user?.displayName || ''} 
                  className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-xl shadow-md border border-slate-100 text-indigo-600 hover:text-indigo-500 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{user?.displayName}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">Pro</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</p>
                </div>
                <div className="w-px h-8 bg-slate-100 self-center" />
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">Active</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    readOnly 
                    value={user?.displayName || ''}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    readOnly 
                    value={user?.email || ''}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-600 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-indigo-600" />
                Security & Account
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Member Since</p>
                      <p className="text-xs text-slate-500">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Account Verified</p>
                      <p className="text-xs text-slate-500">Your account is secured with Google</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={signOut}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
              <button 
                onClick={deleteAccount}
                className="flex-1 py-4 bg-white border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Delete Profile Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
