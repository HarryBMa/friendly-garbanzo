import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { sv } from '../i18n/sv';
import { formatTime, getRelativeDayDescription } from '../utils/dateHelpers';
import DashboardLayout from '../components/Dashboard/DashboardLayout';

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
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content mb-4">
            {sv.dashboard.noSchedule}
          </h1>
          <button 
            className="btn btn-primary"
            onClick={handleExitDashboard}
          >
            Tillbaka till planering
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-300">
      {/* Dashboard Header */}
      <div className="bg-primary text-primary-content px-4 py-2">
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
            {/* Day Navigation */}
            <div className="flex gap-1">
              {currentWeek.days.map((day) => (
                <button
                  key={day.id}
                  className={`btn btn-xs ${
                    currentDayId === day.id 
                      ? 'btn-secondary' 
                      : 'btn-ghost text-primary-content'
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
            </div>

            <div className="flex gap-2">
              <button 
                className="btn btn-xs btn-ghost text-primary-content"
                onClick={toggleFullscreen}
                title={sv.dashboard.fullscreen}
              >
                ⛶
              </button>
              <button 
                className="btn btn-xs btn-ghost text-primary-content"
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
      </div>

      {/* Footer with keyboard shortcuts */}
      <div className="fixed bottom-0 left-0 right-0 bg-base-300/90 text-base-content/60 text-xs p-2">
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
