export type MedchronStatus =
  | { kind: "not_initiated" }
  | { kind: "review"; pendingCount: number }
  | { kind: "pending" }
  | { kind: "in_progress"; processed: number; total: number }
  | { kind: "completed" };

export interface DashboardProjectRow {
  projectId: string;
  projectName: string;
  status: MedchronStatus;
  initiatedBy?: { id: string; name: string } | null;
  initiatedAt?: string | null;
}

export interface VerificationCandidate {
  docId: string;
  fileName: string;
  path: string;
  type?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  included: boolean;
  isFolder?: boolean;
  children?: VerificationCandidate[];
}

export interface RunSnapshot {
  projectId: string;
  includedDocIds: string[];
  excludedDocIds: string[];
  initiatedBy: string;
  initiatedAt: string;
}

export interface User {
  id: string;
  name: string;
}

export interface SimulationState {
  projects: DashboardProjectRow[];
  selectedProjects: Set<string>;
  searchTerm: string;
  statusFilter: Set<MedchronStatus['kind']>;
  sortBy: 'projectName' | 'initiatedAt' | 'status';
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
}

export interface ProjectVerificationState {
  projectId: string;
  projectName: string;
  candidates: VerificationCandidate[];
  isRunning: boolean;
  runSnapshot?: RunSnapshot;
}