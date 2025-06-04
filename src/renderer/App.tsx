import { useEffect, useState } from 'react';
import { useAppStore } from './stores/appStore';
import Admin from './routes/Admin';
import Dashboard from './routes/Dashboard';
import Settings from './routes/Settings';

function App() {
  const { isDashboardMode } = useAppStore();
  const [currentPage, setCurrentPage] = useState<'admin' | 'settings'>('admin');
  // Declare electronAPI for TypeScript
  useEffect(() => {
    // Handle main process messages if needed
    if (window.electronAPI?.onMainProcessMessage) {
      window.electronAPI.onMainProcessMessage((message: string) => {
        console.log('Main process message:', message);
      });
    }

    // Global key handler for settings access
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === ',') {
        event.preventDefault();
        setCurrentPage('settings');
      }
      if (event.key === 'Escape' && currentPage === 'settings') {
        setCurrentPage('admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-200">
      {isDashboardMode ? (
        <Dashboard />
      ) : currentPage === 'settings' ? (
        <Settings onBack={() => setCurrentPage('admin')} />
      ) : (
        <Admin onOpenSettings={() => setCurrentPage('settings')} />
      )}
    </div>
  );
}

export default App;
