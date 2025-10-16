import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DashboardProjectRow, MedchronStatus } from '../types';
import { generateMockProjects } from '../utils/mockData';

interface SimulationContextType {
  projects: DashboardProjectRow[];
  selectedProjects: Set<string>;
  toggleProjectSelection: (projectId: string) => void;
  selectAllProjects: (projectIds: string[]) => void;
  clearSelection: () => void;
  initiateProjects: (projectIds: string[]) => void;
  updateProjectStatus: (projectId: string, status: MedchronStatus) => void;
  refreshProjects: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<DashboardProjectRow[]>(() => generateMockProjects());
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [simulationQueue, setSimulationQueue] = useState<string[]>([]);

  const updateProjectStatus = useCallback((projectId: string, status: MedchronStatus) => {
    setProjects(prev => prev.map(p =>
      p.projectId === projectId ? { ...p, status } : p
    ));
  }, []);

  const simulateProgress = useCallback((projectId: string) => {
    let progress = 0;
    const total = Math.floor(Math.random() * 30) + 20;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      
      if (progress >= total) {
        updateProjectStatus(projectId, { kind: 'completed' });
        clearInterval(interval);
        setSimulationQueue(prev => prev.filter(id => id !== projectId));
      } else {
        updateProjectStatus(projectId, { 
          kind: 'in_progress', 
          processed: progress, 
          total 
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [updateProjectStatus]);

  const initiateProjects = useCallback((projectIds: string[]) => {
    const now = new Date().toISOString();
    const user = { id: 'current', name: 'Current User' };

    setProjects(prev => prev.map(project => {
      if (projectIds.includes(project.projectId)) {
        return {
          ...project,
          status: { kind: 'pending' },
          initiatedAt: now,
          initiatedBy: user,
        };
      }
      return project;
    }));

    projectIds.forEach((projectId, index) => {
      setTimeout(() => {
        updateProjectStatus(projectId, { 
          kind: 'in_progress', 
          processed: 0, 
          total: Math.floor(Math.random() * 30) + 20 
        });
        setSimulationQueue(prev => [...prev, projectId]);
      }, (index + 1) * 2000);
    });
  }, [updateProjectStatus]);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    
    simulationQueue.forEach(projectId => {
      const cleanup = simulateProgress(projectId);
      cleanupFunctions.push(cleanup);
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [simulationQueue, simulateProgress]);

  const toggleProjectSelection = useCallback((projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  }, []);

  const selectAllProjects = useCallback((projectIds: string[]) => {
    setSelectedProjects(new Set(projectIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProjects(new Set());
  }, []);

  const refreshProjects = useCallback(() => {
    setProjects(generateMockProjects());
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        projects,
        selectedProjects,
        toggleProjectSelection,
        selectAllProjects,
        clearSelection,
        initiateProjects,
        updateProjectStatus,
        refreshProjects,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}