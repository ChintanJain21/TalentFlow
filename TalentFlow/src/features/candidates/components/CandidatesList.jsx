import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  
  // 🚀 GET ALL CANDIDATES FOR STAGE COUNTS
  const [allCandidates, setAllCandidates] = useState([]);

  // 🚀 CALCULATE STAGE COUNTS FROM ALL CANDIDATES
  const stageStats = useMemo(() => {
    const stats = {
      all: allCandidates.length,
      applied: 0,
      screen: 0,
      tech: 0,
      offer: 0,
      hired: 0,
      rejected: 0
    };

    allCandidates.forEach(candidate => {
      if (stats[candidate.stage] !== undefined) {
        stats[candidate.stage]++;
      }
    });

    return stats;
  }, [allCandidates]);

  const stages = [
    { value: 'all', label: 'All Stages', count: stageStats.all },
    { value: 'applied', label: 'Applied', count: stageStats.applied },
    { value: 'screen', label: 'Screening', count: stageStats.screen },
    { value: 'tech', label: 'Technical', count: stageStats.tech },
    { value: 'offer', label: 'Offer', count: stageStats.offer },
    { value: 'hired', label: 'Hired', count: stageStats.hired },
    { value: 'rejected', label: 'Rejected', count: stageStats.rejected }
  ];

  // 🚀 FETCH ALL CANDIDATES FOR STATS (separate from paginated list)
  const fetchAllCandidatesForStats = async () => {
    try {
      const response = await fetch('/api/candidates?page=1&pageSize=2000'); // Get all
      const data = await response.json();
      setAllCandidates(data.data || []);
      console.log('📊 Fetched all candidates for stats:', data.data?.length);
    } catch (error) {
      console.error('Error fetching all candidates for stats:', error);
    }
  };

  const fetchCandidates = async (page = 1) => {
    console.log('🔍 fetchCandidates called with page:', page);
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(search && { search }),
        ...(stageFilter !== 'all' && { stage: stageFilter }),
        ...(jobFilter !== 'all' && { jobId: jobFilter })
      });

      console.log('🔍 Fetching:', `/api/candidates?${params}`);
      const response = await fetch(`/api/candidates?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 Response data:', data);

      setCandidates(data.data || []);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages
      });

      console.log(`✅ Set ${data.data?.length || 0} candidates (Total: ${data.total})`);
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all candidates for stats on mount
  useEffect(() => {
    fetchAllCandidatesForStats();
  }, []);

  // Fetch paginated candidates when filters change
  useEffect(() => {
    fetchCandidates(1);
  }, [search, stageFilter, jobFilter]);

  // Format functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      screen: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      hired: 'bg-green-200 text-green-900',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates</h1>
        <p className="text-gray-600">
          Manage and review candidate applications ({stageStats.all} total candidates)
        </p>
      </div>

     
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Candidates
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Stage Filter */}
          <div className="w-full lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label} ({stage.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {stages.slice(1).map(stage => (
          <div 
            key={stage.value} 
            className={`bg-white rounded-lg shadow-sm border p-4 text-center cursor-pointer hover:shadow-md transition-shadow ${stageFilter === stage.value ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setStageFilter(stage.value)}
          >
            <div className="text-2xl font-bold text-gray-900">{stage.count}</div>
            <div className="text-sm text-gray-600">{stage.label}</div>
          </div>
        ))}
      </div>

      {/* Rest of your existing table code... */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No candidates found.</p>
            <p className="text-sm text-gray-500 mt-2">
              Total candidates in database: {stageStats.all}
            </p>
          </div>
        ) : (
          <>
            {/* Your existing table JSX */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map(candidate => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidate.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(candidate.stage)}`}>
                          {candidate.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {candidate.experience} years
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(candidate.appliedDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <Link
                          to={`/candidates/${candidate.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => fetchCandidates(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchCandidates(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => fetchCandidates(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => fetchCandidates(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CandidatesList;
