/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GoalTracker from './components/GoalTracker';
import AICoach from './components/AICoach';
import StrategyCanvas from './components/StrategyCanvas';
import Billing from './components/Billing';
import MusicLab from './components/MusicLab';
import Profile from './components/Profile';
import DashMain from './components/FinSphere/DashMain';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="finsphere" element={<DashMain />} />
            <Route path="goals" element={<GoalTracker />} />
            <Route path="coach" element={<AICoach />} />
            <Route path="strategy" element={<StrategyCanvas />} />
            <Route path="billing" element={<Billing />} />
            <Route path="music" element={<MusicLab />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
