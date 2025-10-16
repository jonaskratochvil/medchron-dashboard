# MedChron Dashboard Mock Frontend

This is a mock implementation of the MedChron Dashboard and Project Verification views based on the provided designs and documentation.

## Features Implemented

### MedChron Dashboard (/advanced/medchron)
✅ Summary cards showing project counts by status
✅ Projects table with sorting, filtering, and bulk selection
✅ Search functionality by project name
✅ Status filtering (multi-select)
✅ Bulk initiation with confirmation modal
✅ Real-time progress simulation
✅ Pagination controls

### Project Verification View (/projects/:id/medchron)
✅ Document tree view with folder structure
✅ Checkbox-based inclusion/exclusion
✅ Bulk folder actions (Exclude All)
✅ Document metadata display
✅ Run MedChron button with document count
✅ Progress tracking during processing
✅ Navigation back to dashboard

### Simulation Features
✅ Automatic status transitions
✅ Progress percentage updates for in-progress items
✅ Mock data generation (274 projects)
✅ Realistic timing for state changes
✅ Status persistence during navigation

## Setup Instructions

1. First, fix the npm permissions issue:
```bash
sudo chown -R $(whoami) ~/.npm
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## How to Use

### Dashboard
1. The dashboard shows an overview of all projects with their MedChron status
2. Use the search bar to find specific projects
3. Filter by status using the filter buttons
4. Select multiple projects and click "Initiate" to bulk start MedChron processing
5. Click on a project name to navigate to its verification view

### Project Verification
1. Review the automatically identified medical documents
2. Use checkboxes to include/exclude specific documents
3. Expand/collapse folders to see document details
4. Click "Initiate MedChron" to start processing selected documents
5. Watch the real-time progress bar as documents are processed

## Technologies Used
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

## Mock Data
The application generates:
- 274 mock projects with various statuses
- Random medical documents for each project
- Simulated users and timestamps
- Realistic progress updates during processing