import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, FolderOpen, FileText, Plus, X, Check, PlayCircle, Info } from 'lucide-react';
import { VerificationCandidate } from '../types';
import { generateMockDocuments, getProjectById } from '../utils/mockData';
import { useSimulation } from '../contexts/SimulationContext';
import StatusBadge from '../components/StatusBadge';

export default function ProjectVerification() {
  const { projectId } = useParams<{ projectId: string }>();
  const { updateProjectStatus, projects } = useSimulation();
  const [candidates, setCandidates] = useState<VerificationCandidate[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const project = useMemo(() => {
    return projects.find(p => p.projectId === projectId);
  }, [projects, projectId]);

  useEffect(() => {
    if (projectId) {
      const docs = generateMockDocuments(projectId);
      setCandidates(docs);
      setExpandedFolders(new Set(docs.map(d => d.docId)));
    }
  }, [projectId]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const toggleDocumentInclusion = (docId: string, parentId?: string) => {
    setCandidates(prev => {
      return prev.map(folder => {
        if (parentId && folder.docId === parentId && folder.children) {
          return {
            ...folder,
            children: folder.children.map(doc =>
              doc.docId === docId ? { ...doc, included: !doc.included } : doc
            ),
          };
        } else if (folder.docId === docId) {
          const newIncluded = !folder.included;
          return {
            ...folder,
            included: newIncluded,
            children: folder.children?.map(child => ({ ...child, included: newIncluded })),
          };
        }
        return folder;
      });
    });
  };

  const toggleFolderInclusion = (folderId: string) => {
    setCandidates(prev => {
      return prev.map(folder => {
        if (folder.docId === folderId) {
          const newIncluded = !folder.included;
          return {
            ...folder,
            included: newIncluded,
            children: folder.children?.map(child => ({ ...child, included: newIncluded })),
          };
        }
        return folder;
      });
    });
  };

  const includedCount = useMemo(() => {
    let count = 0;
    candidates.forEach(folder => {
      if (folder.children) {
        count += folder.children.filter(doc => doc.included).length;
      }
    });
    return count;
  }, [candidates]);

  const handleRunMedChron = () => {
    if (!projectId || !project) return;
    
    setIsRunning(true);
    updateProjectStatus(projectId, { kind: 'pending' });
    
    setTimeout(() => {
      updateProjectStatus(projectId, {
        kind: 'in_progress',
        processed: 0,
        total: includedCount,
      });
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 3) + 1;
        
        if (progress >= includedCount) {
          updateProjectStatus(projectId, { kind: 'completed' });
          clearInterval(interval);
          setIsRunning(false);
        } else {
          updateProjectStatus(projectId, {
            kind: 'in_progress',
            processed: progress,
            total: includedCount,
          });
        }
      }, 1000);
    }, 2000);
  };

  const handleExcludeAll = (folderId: string) => {
    setCandidates(prev => {
      return prev.map(folder => {
        if (folder.docId === folderId && folder.children) {
          return {
            ...folder,
            included: false,
            children: folder.children.map(child => ({ ...child, included: false })),
          };
        }
        return folder;
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/advanced/medchron" className="text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2 text-sm">
              <span>Feed</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span>Tasks</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span>Project Hub</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span>Documents</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 border rounded text-sm">Discovery</button>
            <button className="px-3 py-1.5 border rounded text-sm">Vitals</button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {project?.projectName || 'Project'}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">MedChron Status:</span>
                {project && <StatusBadge status={project.status} />}
              </div>
            </div>
            {!isRunning && project?.status.kind !== 'in_progress' && (
              <button
                onClick={handleRunMedChron}
                disabled={includedCount === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                  includedCount > 0
                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <PlayCircle className="w-5 h-5" />
                <span>Initiate MedChron</span>
              </button>
            )}
          </div>

          {project?.status.kind === 'in_progress' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Processing Documents</span>
                <span className="text-sm text-blue-700">
                  {project.status.processed} / {project.status.total}
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(project.status.processed / project.status.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-2">Welcome to MedChron by Filevine</h2>
            <p className="text-sm text-gray-600 mb-4">
              MedChron uses AI to generate a comprehensive medical chronology based on all relevant documents uploaded to this project, 
              helping you quickly understand a patient's treatments, diagnoses, and overall medical history.
            </p>
            {includedCount === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      No medical documents found in this project. Add documents to begin using MedChron.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1">Source documents</h3>
                  <p className="text-sm text-gray-600">
                    {includedCount} document{includedCount !== 1 ? 's' : ''} from this project will be included as sources to initiate MedChron
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 border border-cyan-500 text-cyan-600 rounded hover:bg-cyan-50"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add documents</span>
                </button>
              </div>
            )}
          </div>

          <div className="divide-y">
            {candidates.map((folder) => (
              <div key={folder.docId}>
                <div className="flex items-center px-4 py-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={folder.included}
                    onChange={() => toggleFolderInclusion(folder.docId)}
                    className="mr-3"
                  />
                  <button
                    onClick={() => toggleFolder(folder.docId)}
                    className="flex items-center space-x-2 flex-1 text-left"
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        expandedFolders.has(folder.docId) ? 'rotate-90' : ''
                      }`}
                    />
                    <FolderOpen className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium">{folder.fileName}</span>
                    <span className="text-sm text-gray-500">
                      ({folder.children?.filter(d => d.included).length || 0} included)
                    </span>
                  </button>
                  <button
                    onClick={() => handleExcludeAll(folder.docId)}
                    className="text-sm text-red-600 hover:text-red-700 px-2"
                  >
                    Exclude All
                  </button>
                </div>

                {expandedFolders.has(folder.docId) && folder.children && (
                  <div className="bg-gray-50 border-t">
                    {folder.children.map((doc) => (
                      <div
                        key={doc.docId}
                        className="flex items-center px-8 py-2 hover:bg-gray-100 border-b border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={doc.included}
                          onChange={() => toggleDocumentInclusion(doc.docId, folder.docId)}
                          className="mr-3"
                        />
                        <FileText className="w-4 h-4 text-red-500 mr-2" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{doc.fileName}</div>
                          <div className="text-xs text-gray-500">
                            Uploaded by {doc.uploadedBy} • {new Date(doc.uploadedAt || '').toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.included ? (
                            <span className="flex items-center text-xs text-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              Included
                            </span>
                          ) : (
                            <span className="flex items-center text-xs text-gray-400">
                              <X className="w-3 h-3 mr-1" />
                              Excluded
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {includedCount > 0 && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="text-sm text-gray-600">
                {includedCount} document{includedCount !== 1 ? 's' : ''} will be included as sources to initiate MedChron
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Documents</h3>
            <p className="text-gray-600 mb-6">
              Select additional documents from your project folders to include in the MedChron analysis.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}