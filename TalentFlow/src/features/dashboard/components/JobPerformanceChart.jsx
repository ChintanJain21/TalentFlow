import { Briefcase, TrendingUp, Users, Award, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const JobPerformanceChart = ({ data }) => {
  const { isDark } = useTheme();

  // Sort jobs by total applications
  const sortedJobs = data.sort((a, b) => b.totalApplications - a.totalApplications);
  const topJobs = sortedJobs.slice(0, 8); // Show top 8 jobs

  const maxApplications = Math.max(...topJobs.map(job => job.totalApplications));

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Engineering': 'text-blue-600 dark:text-blue-400',
      'Marketing': 'text-purple-600 dark:text-purple-400',
      'Sales': 'text-green-600 dark:text-green-400',
      'HR': 'text-orange-600 dark:text-orange-400',
      'Design': 'text-pink-600 dark:text-pink-400',
      'Product': 'text-indigo-600 dark:text-indigo-400',
      'Operations': 'text-cyan-600 dark:text-cyan-400'
    };
    return colors[department] || 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Job Performance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Applications and conversion rates by job</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Briefcase size={16} />
          <span>Top {topJobs.length} Jobs</span>
        </div>
      </div>

      <div className="space-y-4">
        {topJobs.map((job, index) => {
          const applicationWidth = maxApplications > 0 ? (job.totalApplications / maxApplications) * 100 : 0;
          const conversionRate = parseFloat(job.conversionRate);
          
          return (
            <div key={job.id} className="relative p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {/* Job Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`}></div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {job.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-50 truncate max-w-xs">
                    {job.title}
                  </h4>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`font-medium ${getDepartmentColor(job.department)}`}>
                    {job.department}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {job.type}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {job.totalApplications}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {job.hired}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hired</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {job.inProgress}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${
                    conversionRate >= 10 ? 'text-green-600 dark:text-green-400' :
                    conversionRate >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {job.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
                </div>
              </div>

              {/* Application Volume Bar */}
              <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out"
                  style={{ width: `${applicationWidth}%` }}
                ></div>
              </div>
              
              {/* Performance Indicator */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Rank #{index + 1}
                </span>
                <div className="flex items-center space-x-1">
                  {conversionRate >= 10 ? (
                    <TrendingUp size={12} className="text-green-500" />
                  ) : conversionRate >= 5 ? (
                    <Users size={12} className="text-yellow-500" />
                  ) : (
                    <AlertCircle size={12} className="text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    conversionRate >= 10 ? 'text-green-600 dark:text-green-400' :
                    conversionRate >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {conversionRate >= 10 ? 'High Performance' :
                     conversionRate >= 5 ? 'Average Performance' :
                     'Needs Attention'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {data.reduce((sum, job) => sum + job.totalApplications, 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Applications</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {data.reduce((sum, job) => sum + job.hired, 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Hires</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {data.length > 0 ? (data.reduce((sum, job) => sum + parseFloat(job.conversionRate), 0) / data.length).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Conversion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPerformanceChart;
