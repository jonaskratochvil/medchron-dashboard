import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight, Settings, FileText, FolderOpen, Menu, User, Bell } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/advanced/medchron');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center space-x-4">
            <Menu className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5" />
              <span className="font-medium">Feed</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5" />
              <span>Projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Documents</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">Filevine</div>
            <input
              type="text"
              placeholder="Search for a project, contact, tag, etc."
              className="bg-gray-800 text-white placeholder-gray-400 px-4 py-1.5 rounded w-80 text-sm"
            />
            <Bell className="w-5 h-5" />
            <Settings className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 p-1 bg-gray-700 rounded-full" />
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {isDashboard && (
        <div className="bg-white border-b">
          <div className="px-6 py-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium">Advanced</span>
              <select className="border rounded px-2 py-1">
                <option>Org</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {isDashboard && (
          <aside className="w-64 bg-white border-r min-h-screen">
            <div className="p-4">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Filter Menu"
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
              </div>
              <nav className="space-y-1">
                <Link
                  to="/advanced/medchron"
                  className="flex items-center space-x-2 px-3 py-2 bg-cyan-50 text-cyan-600 rounded font-medium"
                >
                  <div className="w-1 h-1 bg-cyan-600 rounded-full"></div>
                  <span>MedChron Dashboard</span>
                </Link>
              </nav>
            </div>
          </aside>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}