import React, { useState } from 'react';

const CandidateFilters = ({ 
  search, 
  setSearch, 
  stageFilter, 
  setStageFilter, 
  jobFilter,
  setJobFilter,
  stagesWithCounts, 
  viewMode,
  showStageFilter = true,
  totalCandidates = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock jobs data for job filter (you can replace with actual jobs data)
  const mockJobs = [
    { id: 'all', title: 'All Jobs' },
    { id: 1, title: 'Frontend Developer' },
    { id: 2, title: 'Backend Developer' },
    { id: 3, title: 'Full Stack Developer' },
    { id: 4, title: 'React Developer' },
    { id: 5, title: 'Node.js Developer' },
    { id: 6, title: 'Python Developer' },
    { id: 7, title: 'DevOps Engineer' },
    { id: 8, title: 'Data Scientist' },
    { id: 9, title: 'UI/UX Designer' },
    { id: 10, title: 'Product Manager' }
  ];

  const clearAllFilters = () => {
    setSearch('');
    setStageFilter('all');
    if (setJobFilter) setJobFilter('all');
  };

  const hasActiveFilters = search || stageFilter !== 'all' || (jobFilter && jobFilter !== 'all');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      {/* Main Filter Bar */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <span className="mr-2">🔍</span>
              Search Candidates
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {search ? (
                  <button
                    onClick={() => setSearch('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Stage Filter (only in list view) */}
          {showStageFilter && (
            <div className="w-full lg:w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📊</span>
                Stage
              </label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                {stagesWithCounts.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.icon ? `${stage.icon} ` : ''}{stage.label} ({stage.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <div className="flex items-end">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="mr-2">⚙️</span>
              More Filters
              <svg 
                className={`w-4 h-4 ml-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Summary & Clear */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-blue-800">Active Filters:</span>
              
              {search && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Search: "{search}"
                  <button
                    onClick={() => setSearch('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {stageFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Stage: {stageFilter}
                  <button
                    onClick={() => setStageFilter('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {jobFilter && jobFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Job: {mockJobs.find(j => j.id == jobFilter)?.title}
                  <button
                    onClick={() => setJobFilter('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            
            <button
              onClick={clearAllFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Job Filter */}
            {setJobFilter && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">💼</span>
                  Job Position
                </label>
                <select
                  value={jobFilter || 'all'}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {mockJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Experience Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📈</span>
                Experience Level
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Any Experience</option>
                <option value="0-2">0-2 years (Junior)</option>
                <option value="2-5">2-5 years (Mid-level)</option>
                <option value="5-8">5-8 years (Senior)</option>
                <option value="8+">8+ years (Expert)</option>
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">💰</span>
                Salary Range
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Any Salary</option>
                <option value="0-60">$0 - $60k</option>
                <option value="60-90">$60k - $90k</option>
                <option value="90-120">$90k - $120k</option>
                <option value="120-150">$120k - $150k</option>
                <option value="150+">$150k+</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📍</span>
                Location
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Any Location</option>
                <option value="remote">Remote</option>
                <option value="ny">New York</option>
                <option value="ca">California</option>
                <option value="tx">Texas</option>
                <option value="fl">Florida</option>
              </select>
            </div>

            {/* Applied Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📅</span>
                Applied Date
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">🛠️</span>
                Required Skills
              </label>
              <input
                type="text"
                placeholder="e.g., React, Node.js, Python"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Apply advanced filters logic here
                setIsExpanded(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Kanban Help Section */}
     {/* Kanban Help Section - Updated Design */}
{viewMode === 'kanban' && (
  <div className="border-t border-gray-100 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Hiring Pipeline Rules</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-green-600 text-lg">→</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Forward Only</h4>
          <p className="text-sm text-gray-600">Candidates can only progress forward through stages</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-red-600 text-lg">✖</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Rejection Allowed</h4>
          <p className="text-sm text-gray-600">Can reject from any stage except hired</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-600 text-lg">🔒</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Final States</h4>
          <p className="text-sm text-gray-600">Hired & rejected candidates are locked</p>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Results Summary */}
      <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {hasActiveFilters ? (
              <span>
                <span className="font-medium text-gray-900">{totalCandidates}</span> candidates match your filters
              </span>
            ) : (
              <span>
                Showing all <span className="font-medium text-gray-900">{totalCandidates}</span> candidates
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Last updated: just now</span>
            {viewMode === 'kanban' && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Real-time updates
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateFilters;
