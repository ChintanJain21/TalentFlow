import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const CandidateFilters = ({ 
  search, 
  setSearch, 
  stageFilter, 
  setStageFilter, 
  jobFilter, 
  setJobFilter,
  jobs = [],
  stagesWithCounts, 
  viewMode, 
  showStageFilter, 
  totalCandidates 
}) => {
  const { isDark } = useTheme();
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {

    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Filters</h2>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {totalCandidates} total candidates
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Enhanced Job Filter */}
        <div className="relative">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none transition-all text-gray-900 dark:text-gray-100 font-medium cursor-pointer"
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} - {job.department || job.company}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Filter className="text-gray-400 dark:text-gray-500" size={16} />
          </div>
        </div>

        {/* Enhanced Stage Filter */}
        {showStageFilter && (
          <div className="relative">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none transition-all text-gray-900 dark:text-gray-100 font-medium cursor-pointer"
            >
              {stagesWithCounts.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label} {stage.count > 0 ? `(${stage.count})` : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Filter className="text-gray-400 dark:text-gray-500" size={16} />
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(search || jobFilter !== 'all' || (stageFilter && stageFilter !== 'all')) && (
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active filters:</span>
          
          {search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
              Search: "{search}"
            </span>
          )}
          
          {jobFilter !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
              Job: {jobs.find(j => j.id === jobFilter)?.title || 'Unknown'}
            </span>
          )}
          
          {stageFilter && stageFilter !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
              Stage: {stagesWithCounts.find(s => s.value === stageFilter)?.label || stageFilter}
            </span>
          )}
          
          <button
            onClick={() => {
              setSearch('');
              setJobFilter('all');
              setStageFilter('all');
            }}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateFilters;
