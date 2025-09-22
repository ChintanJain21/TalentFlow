import { Calendar, TrendingUp, Activity } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const TimelineChart = ({ data }) => {
  const { isDark } = useTheme();
  
  const maxApplications = Math.max(...data.map(d => d.applications));
  const totalApplications = data.reduce((sum, d) => sum + d.applications, 0);
  const averagePerDay = totalApplications / data.length;

  // Find trends
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.applications, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.applications, 0) / secondHalf.length;
  const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(1);
  const isPositiveTrend = trendPercentage > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Application Timeline</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Daily applications over the last 30 days</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
            isPositiveTrend 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            <TrendingUp size={14} className={isPositiveTrend ? '' : 'rotate-180'} />
            <span className="text-sm font-medium">
              {isPositiveTrend ? '+' : ''}{trendPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-6">
        <div className="absolute inset-0 flex items-end justify-between space-x-1">
          {data.map((day, index) => {
            const height = maxApplications > 0 ? (day.applications / maxApplications) * 100 : 0;
            const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const isHighActivity = day.applications > averagePerDay * 1.5;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div 
                  className={`w-full rounded-t transition-all duration-500 ease-out relative group-hover:opacity-80 ${
                    isToday ? 'bg-blue-600' :
                    isHighActivity ? 'bg-green-500' :
                    isWeekend ? 'bg-gray-400' :
                    'bg-blue-500'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${day.applications} applications on ${new Date(day.date).toLocaleDateString()}`}
                >
                  {/* Hover tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.applications} apps
                  </div>
                </div>
                
                {/* Date labels (show every 5th day) */}
                {index % 5 === 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-left">
                    {new Date(day.date).getDate()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mb-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Weekdays</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Weekends</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">High Activity</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Today</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{totalApplications}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Applications</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{averagePerDay.toFixed(1)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Daily Average</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{Math.max(...data.map(d => d.applications))}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Peak Day</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${isPositiveTrend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositiveTrend ? '+' : ''}{trendPercentage}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trend</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
