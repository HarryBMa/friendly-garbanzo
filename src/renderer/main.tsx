import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize app data on startup
import { useAppStore } from './stores/appStore'

// Initialize store with default data if empty
const initStore = () => {
  const store = useAppStore.getState();
  if (store.weeks.length === 0) {
    store.resetToDefaults();
  }
};

initStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
