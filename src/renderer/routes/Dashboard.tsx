import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { sv } from '../i18n/sv';
import { formatTime, getRelativeDayDescription } from '../utils/dateHelpers';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard() {
  const { 
    currentDayId, 
    getCurrentDay, 
    getCurrentWeek,
    setCurrentDay,
    setDashboardMode,
    settings
  } = useAppStore();

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [_isFullscreen, setIsFullscreen] = useState(false);

  const currentDay = getCurrentDay();
  const currentWeek = getCurrentWeek();

  // Auto-refresh functionality
  useEffect(() => {
    if (!settings.autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval]);

  // Keyboard navigation for switching days
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!currentWeek) return;

      const currentIndex = currentWeek.days.findIndex(day => day.id === currentDayId);
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowRight':
          newIndex = Math.min(currentWeek.days.length - 1, currentIndex + 1);
          break;
        case 'Escape':
          setDashboardMode(false);
          return;
        case 'F11':
          event.preventDefault();
          toggleFullscreen();
          return;
        default:
          return;
      }

      if (newIndex !== currentIndex) {
        setCurrentDay(currentWeek.days[newIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentDayId, currentWeek, setCurrentDay, setDashboardMode]);

  const toggleFullscreen = () => {
    if (window.electronAPI?.toggleFullscreen) {
      window.electronAPI.toggleFullscreen().then((isFs: boolean) => {
        setIsFullscreen(isFs);
      });
    }
  };

  const handleDaySwitch = (dayId: string) => {
    setCurrentDay(dayId);
  };

  const handleExitDashboard = () => {
    setDashboardMode(false);
  };
  if (!currentDay || !currentWeek) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {sv.dashboard.noSchedule}</h1>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={handleExitDashboard}
          >
            Tillbaka till planering
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header */}
      <div className="bg-blue-600 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">
              {sv.dashboard.title}
            </h1>
            <div className="text-sm opacity-90">
              {currentDay.dayName} • {getRelativeDayDescription(currentDay.date)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Day Navigation */}            <div className="flex gap-1">
              {currentWeek.days.map((day) => (
                <button
                  key={day.id}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    currentDayId === day.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-transparent text-white hover:bg-white/20'
                  }`}
                  onClick={() => handleDaySwitch(day.id)}
                >
                  {day.dayName.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Status and Controls */}
            <div className="text-xs opacity-75">
              {sv.dashboard.lastUpdated}: {formatTime(lastUpdated)}
            </div>            <div className="flex gap-2">
              <button 
                className="px-2 py-1 text-xs bg-transparent text-white hover:bg-white/20 rounded transition-colors"
                onClick={toggleFullscreen}
                title={sv.dashboard.fullscreen}
              >
                ⛶
              </button>
              <button 
                className="px-2 py-1 text-xs bg-transparent text-white hover:bg-white/20 rounded transition-colors"
                onClick={handleExitDashboard}
                title="Tillbaka till planering"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-2">
        <DashboardLayout day={currentDay} />
      </div>      {/* Footer with keyboard shortcuts */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 text-gray-400 text-xs p-2">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            ← → Växla dag • ESC Planering • F11 Helskärm
          </div>
          <div>
            {currentWeek.name}
          </div>
        </div>
      </div>
    </div>
  );
}
