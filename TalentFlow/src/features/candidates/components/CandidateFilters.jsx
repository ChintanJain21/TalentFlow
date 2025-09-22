import React from 'react';
import { Search, Filter } from 'lucide-react';

const CandidateFilters = ({ 
  search, 
  setSearch, 
  stageFilter, 
  setStageFilter, 
  jobFilter, 
  setJobFilter,
  jobs = [], // ✅ NEW: Jobs prop
  stagesWithCounts, 
  viewMode, 
  showStageFilter, 
  totalCandidates 
}) => {
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Trigger search on Enter key
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <span className="text-sm text-gray-500">{totalCandidates} total candidates</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* ✅ NEW: Job Filter */}
        <div className="relative">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} - {job.department || job.company}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Filter className="text-gray-400" size={16} />
          </div>
        </div>

        {/* Stage Filter */}
        {showStageFilter && (
          <div className="relative">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {stagesWithCounts.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label} {stage.count > 0 ? `(${stage.count})` : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Filter className="text-gray-400" size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateFilters;
