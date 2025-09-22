import { 
  Users, 
  Briefcase, 
  Target, 
  Activity,
  Clock,
  TrendingUp,
  Award,
  DollarSign,
  Archive,
  FileText
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const StatsCards = ({ analytics }) => {
  const { isDark } = useTheme();

  const totalInProgress = Object.entries(analytics.candidatesByStage)
    .filter(([stage]) => !['hired', 'rejected'].includes(stage))
    .reduce((sum, [, count]) => sum + count, 0);

  const stats = [
    {
      title: 'Total Jobs',
      value: analytics.totalJobs,
      subtitle: `${analytics.activeJobs} active, ${analytics.archivedJobs} archived`,
      icon: Briefcase,
      color: 'blue'
    },
    {
      title: 'Total Candidates',
      value: analytics.totalCandidates,
      subtitle: 'All applications received',
      icon: Users,
      color: 'green'
    },
    {
      title: 'In Progress',
      value: totalInProgress,
      subtitle: 'Active candidates',
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'Hired',
      value: analytics.candidatesByStage.hired || 0,
      subtitle: `Success rate: ${analytics.totalCandidates > 0 ? (((analytics.candidatesByStage.hired || 0) / analytics.totalCandidates) * 100).toFixed(1) : 0}%`,
      icon: Award,
      color: 'emerald'
    },
    {
      title: 'Assessments',
      value: analytics.assessmentStats.total,
      subtitle: `${analytics.assessmentStats.active} active`,
      icon: Target,
      color: 'orange'
    },
    {
      title: 'Submissions',
      value: analytics.assessmentStats.totalSubmissions,
      subtitle: `Avg score: ${analytics.assessmentStats.averageScore}%`,
      icon: FileText,
      color: 'indigo'
    },
    {
      title: 'Avg Salary',
      value: analytics.salaryStats.count > 0 ? `$${(analytics.salaryStats.average / 1000).toFixed(0)}k` : 'N/A',
      subtitle: `Range: $${(analytics.salaryStats.min / 1000).toFixed(0)}k - $${(analytics.salaryStats.max / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: 'pink'
    },
    {
      title: 'Rejected',
      value: analytics.candidatesByStage.rejected || 0,
      subtitle: `${analytics.totalCandidates > 0 ? (((analytics.candidatesByStage.rejected || 0) / analytics.totalCandidates) * 100).toFixed(1) : 0}% of total`,
      icon: Archive,
      color: 'red'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(stat.color)}`}>
                <IconComponent size={24} />
              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-1">{stat.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
