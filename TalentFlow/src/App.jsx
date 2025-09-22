import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeDatabase } from './db/database';
import { ThemeProvider } from './contexts/ThemeContext';

import Layout from './components/common/Layout';
import JobsBoard from './features/jobs/components/JobsBoard';
import JobDetail from './features/jobs/components/JobDetail';
import AssessmentBuilder from './features/assesments/components/AssesmentBuilder';
import CandidatesList from './features/candidates/components/CandidatesList';
import CandidateProfile from './features/candidates/components/CandidateProfile';
import KanbanBoard from './features/candidates/components/KanbanBoard';

// 📊 NEW: Analytics Dashboard
import AnalyticsDashboard from './features/dashboard/Dashboard';

function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        console.log('🚀 Starting TalentFlow...');
        
        await initializeDatabase(true);
        
        setDbReady(true);
        console.log('✅ Ready!');
      } catch (error) {
        console.error('❌ DB Error:', error);
        setDbReady(true);
      }
    };

    initDB();
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-900 dark:text-gray-100 font-medium">Loading TalentFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/jobs" replace />} />
            <Route path="/jobs" element={<JobsBoard />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
            <Route path="/candidates" element={<CandidatesList />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} />
            <Route path="/pipeline" element={<KanbanBoard />} />
            <Route path="/pipeline/:jobId" element={<KanbanBoard />} />
            
            {/* 📊 NEW: Analytics Route */}
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
