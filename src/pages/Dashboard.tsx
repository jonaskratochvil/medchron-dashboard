import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, CheckCircle2, Clock, Hourglass, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useSimulation } from '../contexts/SimulationContext';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/mockData';
import { MedchronStatus } from '../types';

export default function Dashboard() {
  const { projects, selectedProjects, toggleProjectSelection, selectAllProjects, clearSelection, initiateProjects, refreshProjects } = useSimulation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'projectName' | 'initiatedAt' | 'status'>('initiatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const stats = useMemo(() => {
    return {
      completed: projects.filter(p => p.status.kind === 'completed').length,
      inProgress: projects.filter(p => p.status.kind === 'in_progress').length,
      pending: projects.filter(p => p.status.kind === 'pending').length,
      notInitiated: projects.filter(p => p.status.kind === 'not_initiated').length,
      review: projects.filter(p => p.status.kind === 'review').length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.size === 0 || statusFilter.has(project.status.kind);
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'projectName') {
        comparison = a.projectName.localeCompare(b.projectName);
      } else if (sortBy === 'initiatedAt') {
        const dateA = a.initiatedAt ? new Date(a.initiatedAt).getTime() : 0;
        const dateB = b.initiatedAt ? new Date(b.initiatedAt).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortBy === 'status') {
        comparison = a.status.kind.localeCompare(b.status.kind);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredProjects, sortBy, sortDirection]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedProjects.slice(startIndex, startIndex + pageSize);
  }, [sortedProjects, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedProjects.length / pageSize);

  const handleSort = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedProjects.size === paginatedProjects.length) {
      clearSelection();
    } else {
      selectAllProjects(paginatedProjects.map(p => p.projectId));
    }
  };

  const handleInitiate = () => {
    const projectsToInitiate = Array.from(selectedProjects);
    initiateProjects(projectsToInitiate);
    clearSelection();
    setShowConfirmModal(false);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshProjects();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshProjects]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">MedChron Dashboard</h1>
        
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">In progress</div>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <Hourglass className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.notInitiated}</div>
                <div className="text-sm text-gray-600">Not initiated</div>
              </div>
              <Info className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.review}</div>
                <div className="text-sm text-gray-600">Review</div>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by project name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => refreshProjects()}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {selectedProjects.size > 0 && (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                  >
                    Initiate ({selectedProjects.size})
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by status:</span>
              {['completed', 'in_progress', 'pending', 'not_initiated', 'review'].map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    statusFilter.has(status)
                      ? 'bg-cyan-100 text-cyan-700 border-cyan-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProjects.size === paginatedProjects.length && paginatedProjects.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('projectName')}
                      className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <span>Project name</span>
                      {sortBy === 'projectName' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <span>MedChron status</span>
                      {sortBy === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('initiatedAt')}
                      className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <span>Initiation date</span>
                      {sortBy === 'initiatedAt' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Initiated by</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedProjects.map((project) => (
                  <tr key={project.projectId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProjects.has(project.projectId)}
                        onChange={() => toggleProjectSelection(project.projectId)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${project.projectId}/medchron`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {project.projectName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(project.initiatedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {project.initiatedBy?.name || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {sortedProjects.length > 0 ? (
                  <>
                    {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedProjects.length)} of {sortedProjects.length} MedChrons
                  </>
                ) : (
                  <>No projects found</>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    ≪
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    ‹
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    ≫
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Bulk Initiation</h3>
            <p className="text-gray-600 mb-6">
              You are about to initiate MedChron for {selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''}. 
              This action will process medical documents and may incur costs.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiate}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Initiate MedChron
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}