import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import JobsBoard from './features/jobs/components/JobsBoard';
import JobDetail from './features/jobs/components/JobDetail';
import AssessmentBuilder from './features/assesments/components/AssesmentBuilder';
import CandidatesList from './features/candidates/components/CandidatesList';
import CandidateProfile from './features/candidates/components/CandidateProfile';
import KanbanBoard from './features/candidates/components/KanbanBoard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Jobs Routes */}
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobsBoard />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          
          {/* Assessment Routes - JOB SPECIFIC */}
          <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
          
          {/* Candidates Routes */}
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          
          {/* Kanban Routes */}
          <Route path="/pipeline" element={<KanbanBoard />} />
          <Route path="/pipeline/:jobId" element={<KanbanBoard />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
