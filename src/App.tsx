import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider } from './contexts/SimulationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectVerification from './pages/ProjectVerification';

function App() {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/advanced/medchron" replace />} />
            <Route path="/advanced/medchron" element={<Dashboard />} />
            <Route path="/projects/:projectId/medchron" element={<ProjectVerification />} />
          </Routes>
        </Layout>
      </SimulationProvider>
    </BrowserRouter>
  );
}

export default App;