import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Companies from './pages/Companies';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Interviews from './pages/Interviews';
import StudentPortal from './pages/StudentPortal';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleProvider>
      <Router>
        <div className="app-layout">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          <div className="main-wrapper">
            <Topbar 
              onToggleSidebar={() => setSidebarOpen((prev) => !prev)} 
            />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/student-portal" element={<StudentPortal />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </RoleProvider>
  );
}
