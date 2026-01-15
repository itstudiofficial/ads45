
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, User, Task } from './types';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import SpinWheel from './pages/SpinWheel';
import CreateTask from './pages/CreateTask';
import Wallet from './pages/Wallet';
import Referral from './pages/Referral';
import Profile from './pages/Profile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import { AdsprediaBackend } from './backend';

const DEFAULT_TASKS: Task[] = [];

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initApp = async () => {
      await AdsprediaBackend.initialize(DEFAULT_TASKS);
      const sessionUserStr = sessionStorage.getItem('adspredia_session');
      if (sessionUserStr) {
        try {
          const sessionUser = JSON.parse(sessionUserStr);
          const latestUser = await AdsprediaBackend.getUser(sessionUser.email);
          if (latestUser) {
            setAuth({ user: latestUser, isAuthenticated: true });
            sessionStorage.setItem('adspredia_session', JSON.stringify(latestUser));
          } else {
            sessionStorage.removeItem('adspredia_session');
          }
        } catch (e) {
          sessionStorage.removeItem('adspredia_session');
        }
      }
    };
    initApp();
  }, []);

  const handleLogin = (userData: User) => {
    sessionStorage.setItem('adspredia_session', JSON.stringify(userData));
    setAuth({ user: userData, isAuthenticated: true });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adspredia_session');
    setAuth({ user: null, isAuthenticated: false });
  };

  const syncUser = (updatedUser: User) => {
    setAuth(prev => ({ ...prev, user: updatedUser }));
    sessionStorage.setItem('adspredia_session', JSON.stringify(updatedUser));
    // Persist to backend DB immediately
    AdsprediaBackend.saveUser(updatedUser);
  };

  const completeTask = (coins: number) => {
    if (auth.user) {
      const newUser = { 
        ...auth.user, 
        coins: (auth.user.coins || 0) + coins,
        balance: (auth.user.balance || 0) + (coins / 1000)
      };
      syncUser(newUser);
    }
  };

  const handleDeposit = (amount: number) => {
    if (auth.user) {
      AdsprediaBackend.createTransaction(auth.user.id, 'deposit', amount, 'Manual Funding', 'pending');
    }
  };

  const handleCreateTask = (newTask: Task, totalCost: number) => {
    if (auth.user && auth.user.balance >= totalCost) {
      const taskWithCreator = { ...newTask, creatorId: auth.user.id };
      AdsprediaBackend.saveTask(taskWithCreator);
      
      const newUser = { 
        ...auth.user, 
        balance: auth.user.balance - totalCost,
        coins: Math.max(0, (auth.user.coins || 0) - Math.floor(totalCost * 1000))
      };
      
      syncUser(newUser);
      AdsprediaBackend.createTransaction(newUser.id, 'withdrawal', totalCost, 'Campaign Budget', 'completed');
      return true;
    }
    return false;
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={!auth.isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/auth" element={!auth.isAuthenticated ? <Auth onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        
        <Route element={<Layout user={auth.user} onLogout={handleLogout} isAuthenticated={auth.isAuthenticated} />}>
          <Route path="/dashboard" element={<Dashboard user={auth.user} onClaimBonus={syncUser} />} />
          <Route path="/tasks" element={<Tasks onComplete={completeTask} user={auth.user} />} />
          <Route path="/lucky-spin" element={<SpinWheel user={auth.user} onSpinComplete={syncUser} />} />
          <Route path="/create-task" element={<CreateTask user={auth.user} onCreate={handleCreateTask} />} />
          <Route path="/wallet" element={<Wallet user={auth.user} onDeposit={handleDeposit} />} />
          <Route path="/referral" element={<Referral user={auth.user} />} />
          <Route path="/profile" element={<Profile user={auth.user} onUpdateUser={syncUser} onLogout={handleLogout} />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={auth.user?.role === 'admin' ? <Admin /> : <Navigate to="/dashboard" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
