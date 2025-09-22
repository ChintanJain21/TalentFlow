import { DollarSign, TrendingUp, BarChart } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const SalaryDistributionChart = ({ candidates, stats }) => {
  const { isDark } = useTheme();

  // Create salary ranges
  const salaryRanges = [
    { min: 0, max: 50000, label: '$0-50K', count: 0 },
    { min: 50000, max: 75000, label: '$50-75K', count: 0 },
    { min: 75000, max: 100000, label: '$75-100K', count: 0 },
    { min: 100000, max: 125000, label: '$100-125K', count: 0 },
    { min: 125000, max: 150000, label: '$125-150K', count: 0 },
    { min: 150000, max: 200000, label: '$150-200K', count: 0 },
    { min: 200000, max: Infinity, label: '$200K+', count: 0 }
  ];

  // Categorize candidates by salary range
  candidates.forEach(candidate => {
    const salary = candidate.salary || 0;
    if (salary > 0) {
      const range = salaryRanges.find(r => salary >= r.min && salary < r.max);
      if (range) range.count++;
    }
  });

  const maxCount = Math.max(...salaryRanges.map(r => r.count));
  const totalWithSalary = salaryRanges.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Salary Distribution</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Expected salary ranges from candidates</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <DollarSign size={16} />
          <span>{totalWithSalary} candidates</span>
        </div>
      </div>

      {totalWithSalary === 0 ? (
        <div className="text-center py-8">
          <DollarSign size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No salary data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Candidates haven't provided salary expectations yet
          </p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="space-y-3 mb-6">
            {salaryRanges.map((range, index) => {
              const width = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
              const percentage = totalWithSalary > 0 ? ((range.count / totalWithSalary) * 100).toFixed(1) : 0;
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-right">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {range.label}
                    </span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                          index === 0 ? 'bg-red-500' :
                          index === 1 ? 'bg-orange-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-green-500' :
                          index === 4 ? 'bg-blue-500' :
                          index === 5 ? 'bg-indigo-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${width}%` }}
                      ></div>
                      
                      {/* Count label inside bar */}
                      {range.count > 0 && width > 15 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {range.count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-16 text-left">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                  
                  <div className="w-8 text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-50">
                      {range.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ${(stats.average / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ${(stats.min / 1000).toFixed(0)}K - ${(stats.max / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Range</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {((stats.count / candidates.length) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Coverage</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalaryDistributionChart;
