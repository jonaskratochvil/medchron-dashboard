import { DashboardProjectRow, MedchronStatus, User, VerificationCandidate } from '../types';

const users: User[] = [
  { id: '1', name: 'Olivia Carter' },
  { id: '2', name: 'Marcus Bennett' },
  { id: '3', name: 'Harper Reed' },
  { id: '4', name: 'System Admin' },
];

const projectNames = [
  'Baker v. Ridgeview Apartments',
  'Ramos v. Northgate Superstore',
  'Parker v. Sunrise Daycare Center',
  'Flores v. Capital Mall Management',
  'Thompson v. Lakeside School District',
  'Mitchell v. Clearview Golf Club',
  'Rivera v. Cascade Transit Authority',
  'Grant v. Horizon Delivery Services',
  'Brooks v. Valley Hospital Corporation',
  'Dixon v. Elm Street Pharmacy',
  'Anderson v. Metro Tech Solutions',
  'Williams v. Central Bank Trust',
  'Johnson v. Premier Medical Group',
  'Davis v. Riverside Insurance',
  'Miller v. Northern Electric Coop',
  'Wilson v. Southside Community Center',
  'Moore v. Westfield Shopping Mall',
  'Taylor v. Highland Construction',
  'Thomas v. Pacific Airways',
  'Jackson v. Downtown Hotel Group',
];

const medicalDocTypes = [
  'Medical Records',
  'Admission Records',
  'Discharge Summary',
  'Treatment Summary',
  'Physician Notes',
  'Radiology Report',
  'Lab Results',
  'Orthopedic Progress Notes',
  'Neurology Office Visit',
  'Pharmacy RX History',
  'Physical Therapy Records',
];

const folders = [
  'Discovery',
  'Depositions',
  'Disclosures',
  'Expert Discovery',
  'Interrogatories',
  'Medical Records',
  'Correspondence',
  'Research',
  'Evidence',
  'Work Product',
  'Billing',
];

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

function generateStatus(): MedchronStatus {
  const rand = Math.random();
  if (rand < 0.5) {
    return { kind: 'completed' };
  } else if (rand < 0.65) {
    const total = Math.floor(Math.random() * 50) + 10;
    const processed = Math.floor(Math.random() * total);
    return { kind: 'in_progress', processed, total };
  } else if (rand < 0.75) {
    return { kind: 'pending' };
  } else if (rand < 0.85) {
    return { kind: 'review', pendingCount: Math.floor(Math.random() * 15) + 1 };
  } else {
    return { kind: 'not_initiated' };
  }
}

export function generateMockProjects(count: number = 56): DashboardProjectRow[] {
  const projects: DashboardProjectRow[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  for (let i = 0; i < count; i++) {
    const status = generateStatus();
    const hasBeenInitiated = status.kind !== 'not_initiated';
    const user = hasBeenInitiated ? users[Math.floor(Math.random() * users.length)] : null;
    
    projects.push({
      projectId: `proj-${i + 1}`,
      projectName: i < projectNames.length ? projectNames[i] : `Case ${i + 1} v. Corporation`,
      status,
      initiatedBy: user,
      initiatedAt: hasBeenInitiated ? randomDate(startDate, endDate) : null,
    });
  }

  projects.sort((a, b) => {
    if (!a.initiatedAt && !b.initiatedAt) return 0;
    if (!a.initiatedAt) return 1;
    if (!b.initiatedAt) return -1;
    return new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime();
  });

  return projects;
}

export function generateMockDocuments(projectId: string): VerificationCandidate[] {
  const documents: VerificationCandidate[] = [];
  
  folders.forEach((folder, folderIndex) => {
    const folderNode: VerificationCandidate = {
      docId: `folder-${folderIndex}`,
      fileName: folder,
      path: `/${folder}`,
      isFolder: true,
      included: true,
      children: [],
    };

    const docCount = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < docCount; i++) {
      const isMedical = folder === 'Medical Records' || Math.random() > 0.7;
      const fileName = isMedical
        ? `Smith_v_MercyHospital_${medicalDocTypes[Math.floor(Math.random() * medicalDocTypes.length)]}.pdf`
        : `Document_${folderIndex}_${i}.docx`;

      folderNode.children!.push({
        docId: `doc-${folderIndex}-${i}`,
        fileName,
        path: `/${folder}/${fileName}`,
        type: fileName.endsWith('.pdf') ? 'PDF' : 'DOCX',
        uploadedBy: users[Math.floor(Math.random() * users.length)].name,
        uploadedAt: randomDate(new Date(2025, 0, 1), new Date()),
        included: isMedical,
      });
    }

    documents.push(folderNode);
  });

  return documents;
}

export function getProjectById(projectId: string): DashboardProjectRow | undefined {
  const projects = generateMockProjects();
  return projects.find(p => p.projectId === projectId);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: MedchronStatus): string {
  switch (status.kind) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'review':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'not_initiated':
      return 'bg-gray-100 text-gray-600 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300';
  }
}

export function getStatusLabel(status: MedchronStatus): string {
  switch (status.kind) {
    case 'completed':
      return 'Complete';
    case 'in_progress':
      return `In progress (${status.processed}/${status.total})`;
    case 'pending':
      return 'Pending';
    case 'review':
      return `Review (${status.pendingCount})`;
    case 'not_initiated':
      return 'Not initiated';
    default:
      return 'Unknown';
  }
}