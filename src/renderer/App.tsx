import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import Admin from './routes/Admin';
import Dashboard from './routes/Dashboard';

function App() {
  const { isDashboardMode } = useAppStore();

  // Declare electronAPI for TypeScript
  useEffect(() => {
    // Handle main process messages if needed
    if (window.electronAPI?.onMainProcessMessage) {
      window.electronAPI.onMainProcessMessage((message: string) => {
        console.log('Main process message:', message);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-base-300">
      {isDashboardMode ? <Dashboard /> : <Admin />}
    </div>
  );
}

export default App;
