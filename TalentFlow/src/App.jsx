import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeDatabase } from './db/database';
import Layout from './components/common/Layout';
import JobsBoard from './features/jobs/components/JobsBoard';
import JobDetail from './features/jobs/components/JobDetail';
import AssessmentBuilder from './features/assesments/components/AssesmentBuilder';
import CandidatesList from './features/candidates/components/CandidatesList';
import CandidateProfile from './features/candidates/components/CandidateProfile';
import KanbanBoard from './features/candidates/components/KanbanBoard';

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
        // Just continue anyway
        setDbReady(true);
      }
    };

    initDB();
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p>Loading TalentFlow...</p>
        </div>
      </div>
    );
  }

  return (
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
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
