import React from 'react';
import { Plus, Search, Filter, MoreVertical, CheckCircle2, Circle, Trash2, X, Target, Sparkles } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthProvider';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface Goal {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  category: string;
  uid: string;
}

export default function GoalTracker() {
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newGoalTitle, setNewGoalTitle] = React.useState('');
  const [newGoalCategory, setNewGoalCategory] = React.useState('Business');
  const [showCelebration, setShowCelebration] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'goals'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Goal[];
      setGoals(goalsData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'goals');
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !user) return;

    try {
      await addDoc(collection(db, 'goals'), {
        title: newGoalTitle,
        category: newGoalCategory,
        status: 'pending',
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      setNewGoalTitle('');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'goals');
    }
  };

  const toggleGoal = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await updateDoc(doc(db, 'goals', id), { status: newStatus });
      
      if (newStatus === 'completed') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#3b82f6']
        });
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `goals/${id}`);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `goals/${id}`);
    }
  };

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-2xl shadow-2xl border border-emerald-100 flex items-center gap-3"
          >
            <div className="bg-emerald-100 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-bold text-slate-900">Goal Achieved! Keep it up!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Goal Tracker</h1>
          <p className="text-slate-500 mt-1">Manage and monitor your strategic objectives.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Add New Goal
        </button>
      </header>

      {/* Add Goal Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create New Goal</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={addGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Goal Title</label>
                <input 
                  type="text" 
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Increase revenue by 20%"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <select 
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>Business</option>
                  <option>Life</option>
                  <option>Finance</option>
                  <option>Health</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all mt-4">
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search goals..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading your goals...</div>
        ) : goals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No goals yet. Start by creating one!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {goals.map((goal) => (
              <div key={goal.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleGoal(goal.id, goal.status)}
                    className="transition-transform active:scale-90"
                  >
                    {goal.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-bold transition-all ${goal.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                        {goal.category}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className={`text-xs font-medium ${
                        goal.status === 'completed' ? 'text-emerald-600' : 
                        goal.status === 'in-progress' ? 'text-indigo-600' : 'text-slate-400'
                      }`}>
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
