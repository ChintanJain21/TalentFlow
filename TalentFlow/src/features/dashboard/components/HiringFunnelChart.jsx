import { Users, Filter, Target, Award, CheckCircle, XCircle, Eye, Phone, Calendar } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const HiringFunnelChart = ({ data }) => {
  const { isDark } = useTheme();

  // Map your actual stages to funnel steps
  const stageMappings = {
    applied: { name: 'Applied', icon: Users, color: 'bg-blue-500', description: 'Initial applications' },
    screen: { name: 'Screening', icon: Eye, color: 'bg-purple-500', description: 'Initial screening' },
    tech: { name: 'Technical', icon: Target, color: 'bg-orange-500', description: 'Technical evaluation' },
    interview: { name: 'Interview', icon: Phone, color: 'bg-indigo-500', description: 'Interview stage' },
    offer: { name: 'Offer', icon: Award, color: 'bg-yellow-500', description: 'Offer extended' },
    hired: { name: 'Hired', icon: CheckCircle, color: 'bg-green-500', description: 'Successfully hired' }
  };

  // Create funnel data from your actual stage data
  const funnelStages = Object.entries(stageMappings).map(([stage, config]) => ({
    stage,
    count: data[stage] || 0,
    ...config
  })).filter(item => item.count > 0 || item.stage === 'hired'); // Always show hired even if 0

  const totalCandidates = Object.values(data).reduce((sum, count) => sum + (count || 0), 0);
  const maxCount = Math.max(...funnelStages.map(stage => stage.count));
  const rejectedCount = data.rejected || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Hiring Funnel</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Candidate progression through stages</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {totalCandidates} candidates
        </div>
      </div>

      <div className="space-y-4">
        {funnelStages.map((item, index) => {
          const IconComponent = item.icon;
          const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const percentage = totalCandidates > 0 ? ((item.count / totalCandidates) * 100).toFixed(1) : 0;
          
          // Calculate drop-off from previous stage
          const previousStage = index > 0 ? funnelStages[index - 1] : null;
          const dropOff = previousStage && previousStage.count > 0 
            ? (((previousStage.count - item.count) / previousStage.count) * 100).toFixed(1)
            : null;
          
          return (
            <div key={item.stage}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                    <IconComponent size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-50">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-50">{item.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}% of total</p>
                </div>
              </div>
              
              <div className="relative h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${width}%` }}
                ></div>
                
                {/* Percentage label inside bar */}
                {width > 20 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {item.count} candidates
                    </span>
                  </div>
                )}
              </div>
              
              {/* Drop-off indicator */}
              {dropOff && dropOff > 0 && (
                <div className="flex justify-end">
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                    -{dropOff}% drop-off
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rejected Candidates Section */}
      {rejectedCount > 0 && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <XCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-red-700 dark:text-red-300">Rejected</p>
                <p className="text-xs text-red-600 dark:text-red-400">Candidates not progressed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-red-700 dark:text-red-300">{rejectedCount}</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {totalCandidates > 0 ? ((rejectedCount / totalCandidates) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Funnel Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {totalCandidates > 0 ? (((data.hired || 0) / totalCandidates) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Overall Success Rate</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Object.entries(data)
                .filter(([stage]) => !['hired', 'rejected'].includes(stage))
                .reduce((sum, [, count]) => sum + (count || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Pipeline</p>
          </div>
          <div>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {funnelStages.length > 1 ? 
                (((funnelStages[0].count - funnelStages[funnelStages.length - 1].count) / funnelStages[0].count) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Attrition</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiringFunnelChart;
