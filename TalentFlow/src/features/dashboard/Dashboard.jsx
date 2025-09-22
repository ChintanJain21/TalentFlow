import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Target, 
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { db ,dbOperations } from '../../db/database';
import StatsCards from './components/StatsCards';
import HiringFunnelChart from './components/HiringFunnelChart';
import JobPerformanceChart from './components/JobPerformanceChart';
;


const AnalyticsDashboard = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    jobs: [],
    candidates: [],
    assessments: [],
    submissions: []
  });

  useEffect(() => {
    fetchTalentFlowData();
  }, []);

  const fetchTalentFlowData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching TalentFlow analytics data...');

      // Fetch data with proper error handling
      const [jobsResult, candidatesResult, assessments, submissions] = await Promise.all([
        dbOperations.getJobs(1, 1000).catch(err => {
          console.warn('Failed to fetch jobs:', err);
          return { data: [] };
        }),
        dbOperations.getAllCandidates().catch(err => {
          console.warn('Failed to fetch candidates:', err);
          return [];
        }),
        dbOperations.getAssessments().catch(err => {
          console.warn('Failed to fetch assessments:', err);
          return [];
        }),
        db.submissions.toArray().catch(err => {
          console.warn('Failed to fetch submissions:', err);
          return [];
        })
      ]);

      const jobs = Array.isArray(jobsResult?.data) ? jobsResult.data : [];
      const candidates = Array.isArray(candidatesResult) ? candidatesResult : [];
      const assessmentsArray = Array.isArray(assessments) ? assessments : [];
      const submissionsArray = Array.isArray(submissions) ? submissions : [];

      console.log('📊 Data fetched:', {
        jobs: jobs.length,
        candidates: candidates.length,
        assessments: assessmentsArray.length,
        submissions: submissionsArray.length
      });

      setDashboardData({
        jobs,
        candidates,
        assessments: assessmentsArray,
        submissions: submissionsArray
      });
    } catch (error) {
      console.error('❌ Error fetching TalentFlow data:', error);
      setError(error.message || 'Failed to load analytics data');
      
      // Set empty data on error
      setDashboardData({
        jobs: [],
        candidates: [],
        assessments: [],
        submissions: []
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FIX: Move analytics calculation to useMemo to ensure it's always defined
  const analytics = useMemo(() => {
    // Ensure all data exists before calculating
    const jobs = dashboardData.jobs || [];
    const candidates = dashboardData.candidates || [];
    const assessments = dashboardData.assessments || [];
    const submissions = dashboardData.submissions || [];

    return {
      // Job Analytics
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job?.status === 'active').length,
      archivedJobs: jobs.filter(job => job?.status === 'archived').length,
      
      // Candidate Analytics (using your exact stage names)
      totalCandidates: candidates.length,
      candidatesByStage: candidates.reduce((acc, candidate) => {
        if (candidate?.stage) {
          acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
        }
        return acc;
      }, {}),
      
      // Salary Analytics
      salaryStats: (() => {
        const salaries = candidates
          .map(c => c?.salary)
          .filter(salary => salary && salary > 0 && !isNaN(salary));
        
        return {
          average: salaries.length > 0 ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length) : 0,
          min: salaries.length > 0 ? Math.min(...salaries) : 0,
          max: salaries.length > 0 ? Math.max(...salaries) : 0,
          count: salaries.length
        };
      })(),
      
      // Job Performance
      jobPerformance: jobs.map(job => {
        const jobCandidates = candidates.filter(c => c?.jobId === job?.id);
        const hiredCount = jobCandidates.filter(c => c?.stage === 'hired').length;
        
        return {
          id: job?.id || 0,
          title: job?.title || 'Untitled Job',
          department: job?.department || 'Unknown',
          type: job?.type || 'Unknown',
          status: job?.status || 'unknown',
          totalApplications: jobCandidates.length,
          hired: hiredCount,
          inProgress: jobCandidates.filter(c => !['hired', 'rejected'].includes(c?.stage)).length,
          rejected: jobCandidates.filter(c => c?.stage === 'rejected').length,
          conversionRate: jobCandidates.length > 0 ? ((hiredCount / jobCandidates.length) * 100).toFixed(1) : '0.0',
          createdAt: job?.createdAt || new Date().toISOString()
        };
      }),
      
      // 🔧 FIX: Always return assessmentStats object with all required properties
      assessmentStats: {
        total: assessments.length,
        active: assessments.filter(a => a?.isActive === true).length,
        totalSubmissions: submissions.length,
        averageScore: (() => {
          const validSubmissions = submissions.filter(s => 
            s?.score !== undefined && s?.score !== null && !isNaN(s.score)
          );
          return validSubmissions.length > 0 
            ? (validSubmissions.reduce((sum, s) => sum + s.score, 0) / validSubmissions.length).toFixed(1)
            : '0.0';
        })()
      },
      
      // Timeline Analytics (applications over time)
      applicationTimeline: (() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();
        
        return last30Days.map(date => {
          const applicationsCount = candidates.filter(c => 
            c?.appliedDate && c.appliedDate.startsWith(date)
          ).length;
          
          return { date, applications: applicationsCount };
        });
      })()
    };
  }, [dashboardData]); // Recalculate when dashboardData changes

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTalentFlowData();
    setRefreshing(false);
  };

  const handleExport = () => {
    try {
      const data = {
        generatedAt: new Date().toISOString(),
        summary: analytics,
        rawData: dashboardData
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentflow-analytics-${new Date().toISOString().split('T')[0]}.json`;  
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading TalentFlow analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 🔧 FIX: Add safety check before rendering
  if (!analytics || !analytics.assessmentStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Calculating analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            📊 TalentFlow Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time insights from your TalentFlow data • {analytics.totalJobs || 0} jobs • {analytics.totalCandidates || 0} candidates • {analytics.assessmentStats?.total || 0} assessments
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
          >
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards analytics={analytics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Hiring Funnel */}
        <HiringFunnelChart data={analytics.candidatesByStage || {}} />
        
        {/* Job Performance */}
        <JobPerformanceChart data={analytics.jobPerformance || []} />
        
       
        {/* Assessment Analytics */}
       
        
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
