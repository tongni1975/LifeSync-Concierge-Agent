import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import ChatInterface from './components/ChatInterface';
import ProjectWriteup from './components/ProjectWriteup';
import ProfileSettings from './components/ProfileSettings';
import WellnessFeed from './components/WellnessFeed';
import MapSection from './components/MapSection';
import { DailyLog, UserProfile, Mood } from './types';

// Mock initial data if empty
const INITIAL_LOGS: DailyLog[] = [
  { id: '1', date: new Date(Date.now() - 86400000 * 2).toISOString(), mood: Mood.Stressed, heartRate: 85, caloriesIn: 2400, exerciseMinutes: 15, notes: 'Work was hard.' },
  { id: '2', date: new Date(Date.now() - 86400000 * 1).toISOString(), mood: Mood.Okay, heartRate: 78, caloriesIn: 2100, exerciseMinutes: 30, notes: 'Better day.' },
  { id: '3', date: new Date().toISOString(), mood: Mood.Great, heartRate: 68, caloriesIn: 1800, exerciseMinutes: 60, notes: 'Crushed the workout!' },
];

const INITIAL_PROFILE: UserProfile = {
  name: "Alex",
  age: 30,
  goals: ["Reduce stress", "Improve cardio", "Track macros"]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wellness' | 'map' | 'tracker' | 'concierge' | 'writeup' | 'settings'>('dashboard');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Load from local storage (Memory persistence)
  useEffect(() => {
    const savedLogs = localStorage.getItem('lifesync_logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      setLogs(INITIAL_LOGS);
    }

    const savedProfile = localStorage.getItem('lifesync_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Save logs to local storage
  useEffect(() => {
    localStorage.setItem('lifesync_logs', JSON.stringify(logs));
  }, [logs]);

  // Save profile to local storage
  useEffect(() => {
    localStorage.setItem('lifesync_profile', JSON.stringify(profile));
  }, [profile]);

  const handleAddLog = (log: DailyLog) => {
    setLogs(prev => [log, ...prev]);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'concierge': return 'AI Concierge';
      case 'map': return 'Path Tracker';
      case 'wellness': return 'Wellness Feed';
      default: return activeTab;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      
      {/* Sidebar / Navigation */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden lg:block text-slate-800">LifeSync</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon="📊" 
            label="Dashboard" 
          />
          <NavButton 
            active={activeTab === 'wellness'} 
            onClick={() => setActiveTab('wellness')} 
            icon="🧘" 
            label="Wellness Feed" 
          />
          <NavButton 
            active={activeTab === 'map'} 
            onClick={() => setActiveTab('map')} 
            icon="🗺️" 
            label="Exercise Map" 
          />
          <NavButton 
            active={activeTab === 'tracker'} 
            onClick={() => setActiveTab('tracker')} 
            icon="📝" 
            label="Tracker" 
          />
          <NavButton 
            active={activeTab === 'concierge'} 
            onClick={() => setActiveTab('concierge')} 
            icon="🤖" 
            label="Concierge Agent" 
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon="⚙️" 
            label="Settings" 
          />
          <div className="pt-8 mt-8 border-t border-slate-100">
             <NavButton 
              active={activeTab === 'writeup'} 
              onClick={() => setActiveTab('writeup')} 
              icon="📑" 
              label="Project Writeup" 
            />
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
              {profile.name[0]}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-700">{profile.name}</p>
              <p className="text-xs text-slate-400">Pro Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 flex justify-around p-4 shadow-lg">
          <button onClick={() => setActiveTab('dashboard')} className="text-2xl">📊</button>
          <button onClick={() => setActiveTab('wellness')} className="text-2xl">🧘</button>
          <button onClick={() => setActiveTab('map')} className="text-2xl">🗺️</button>
          <button onClick={() => setActiveTab('tracker')} className="text-2xl">📝</button>
          <button onClick={() => setActiveTab('concierge')} className="text-2xl">🤖</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-20 lg:ml-64 p-6 lg:p-12 overflow-y-auto mb-20 md:mb-0">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 capitalize">
              {getPageTitle()}
            </h1>
            <p className="text-slate-500 mt-1">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        <div className="animate-fade-in-up">
          {activeTab === 'dashboard' && <Dashboard logs={logs} userProfile={profile} />}
          {activeTab === 'wellness' && <WellnessFeed userProfile={profile} />}
          {activeTab === 'map' && <MapSection />}
          {activeTab === 'tracker' && <Tracker onAddLog={handleAddLog} />}
          {activeTab === 'concierge' && (
            <div className="max-w-4xl mx-auto">
              <ChatInterface userProfile={profile} history={logs} />
            </div>
          )}
          {activeTab === 'settings' && <ProfileSettings profile={profile} onUpdateProfile={handleUpdateProfile} />}
          {activeTab === 'writeup' && <ProjectWriteup />}
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium hidden lg:block">{label}</span>
    </button>
  );
}