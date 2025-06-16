import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import CorridorGrid from '../components/CorridorGrid';
import { useAppStore } from '../stores/appStore';
import { sv } from '../i18n/sv';
import { CustomStaffDialog, AvailableStaffPanel, OperatingRoomsGrid } from '../components/admin';
import type { CustomStaffForm } from '../components/admin';
import { handleUnifiedExcelImport } from '../utils/admin/unifiedImportHandler';
import { useDragAndDrop } from '../hooks/admin/useDragAndDrop';

interface AdminProps {
  onOpenSettings: () => void;
}

export default function Admin({ onOpenSettings }: AdminProps) {
  // Get only isDashboardMode first to check early return
  const isDashboardMode = useAppStore(state => state.isDashboardMode);
  
  // Early return if dashboard mode is active (before any other hooks)
  if (isDashboardMode) {
    return null;
  }  // Now safely get all other store values after early return check
  const { 
    currentWeekId, 
    currentDayId, 
    weeks,
    getCurrentDay, 
    getCurrentWeek,
    setCurrentDay,
    setCurrentWeek,
    setDashboardMode,
    assignStaffToRoom,
    assignStaffToCorridorFunction,
    unassignStaff,
    importMultiWeekFile,
    importIndependentFile,
    updateStaff,
    resetToDefaults,
  } = useAppStore();
  // Debug logging for component initialization
  React.useEffect(() => {
    console.log('🎯 Admin component mounted');
    console.log('🔧 ElectronAPI available:', !!window.electronAPI);
    console.log('📦 Store methods available:', {
      importMultiWeekFile: !!importMultiWeekFile,
      importIndependentFile: !!importIndependentFile,
      getCurrentDay: !!getCurrentDay
    });
    
    if (window.electronAPI) {
      console.log('⚡ ElectronAPI methods:', Object.keys(window.electronAPI));
    }
  }, []);// Use the extracted drag and drop hook
  const { 
    activeStaff, 
    handleDragStart, 
    handleDragEnd, 
    sensors 
  } = useDragAndDrop(
    getCurrentDay,
    assignStaffToRoom,
    assignStaffToCorridorFunction,
    unassignStaff
  );
    // Custom staff dialog state
  const [showCustomStaffDialog, setShowCustomStaffDialog] = React.useState(false);
  const [customStaffForm, setCustomStaffForm] = React.useState<CustomStaffForm>({
    name: '',
    workHours: '',
    comments: ''
  });

  // Filter state for available staff
  const [staffFilter, setStaffFilter] = React.useState('');
  const [workHoursFilter, setWorkHoursFilter] = React.useState('');

  const currentDay = getCurrentDay();
  const currentWeek = getCurrentWeek();

  const handleDaySwitch = (dayId: string) => {
    setCurrentDay(dayId);
  };  const toggleDashboardMode = () => {
    setDashboardMode(!isDashboardMode);
  };
  // Unified import handler
  const handleUnifiedImport = () => handleUnifiedExcelImport(importMultiWeekFile, importIndependentFile);
  
  const handleAddCustomStaff = () => {
    console.log('🚀 Opening custom staff dialog');
    setShowCustomStaffDialog(true);
  };

  // Custom staff dialog handlers
  const handleCustomStaffSubmit = () => {
    const currentDay = getCurrentDay();
    if (currentDay && customStaffForm.name.trim()) {
      const newStaff = {
        id: `custom-${Date.now()}`,
        name: `${customStaffForm.name} (${currentDay.dayName})`,
        workHours: customStaffForm.workHours,
        comments: customStaffForm.comments,
        isCustom: true
      };
      
      // Add to current day's available staff directly
      updateStaff(newStaff.id, newStaff);
      
      // Reset form and close dialog
      setCustomStaffForm({ name: '', workHours: '', comments: '' });
      setShowCustomStaffDialog(false);
    }
  };

  const handleCustomStaffCancel = () => {
    setCustomStaffForm({ name: '', workHours: '', comments: '' });
    setShowCustomStaffDialog(false);
  };

  // Handler to clear everything back to defaults (including week selector)
  const handleClearAvailableStaff = () => {
    resetToDefaults();
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{sv.appTitle} - {sv.planning}</h1>            <div className="flex gap-2">
              <button 
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                onClick={onOpenSettings}
                title="Inställningar (Ctrl+,)"
              >
                ⚙️ Inställningar
              </button>
              <button 
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                onClick={toggleDashboardMode}
              >
                {sv.dashboardView}
              </button>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">        {/* Week Selector */}
        <div className="mb-4">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <select 
                  className="px-3 py-1 border border-gray-300 rounded text-sm bg-white max-w-xs"
                  value={currentWeekId}
                  onChange={(e) => setCurrentWeek(e.target.value)}
                >
                  {weeks.map(week => (
                    <option key={week.id} value={week.id}>
                      {week.name}
                    </option>
                  ))}
                </select>
              </li>
            </ul>
          </div>
        </div>        {/* Day Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-x-2">
            {currentWeek?.days.map((day) => (
              <button
                key={day.id}
                className={`-mb-px py-3 px-4 inline-flex items-center gap-2 text-sm font-medium text-center border border-gray-200 rounded-t-lg focus:outline-none transition-colors ${
                  currentDayId === day.id 
                    ? 'bg-white text-blue-600 border-b-transparent' 
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleDaySwitch(day.id)}
              >
                {day.dayName}
              </button>
            ))}
          </nav>
        </div>

        {/* Current Day Content */}
        {currentDay && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">            {/* Available Staff Panel */}
            <div className="lg:col-span-1">              <AvailableStaffPanel
                availableStaff={currentDay.availableStaff || []}
                staffFilter={staffFilter}
                workHoursFilter={workHoursFilter}
                onStaffFilterChange={setStaffFilter}
                onWorkHoursFilterChange={setWorkHoursFilter}
                onImportExcel={handleUnifiedImport}
                onAddCustomStaff={handleAddCustomStaff}
                onClearAvailableStaff={handleClearAvailableStaff}
                onUpdateStaff={updateStaff}
                onRemoveStaff={unassignStaff}
              /></div>            {/* Operating Rooms */}
            <div className="lg:col-span-2">              <OperatingRoomsGrid
                rooms={currentDay.rooms || []}
                onUnassignStaff={unassignStaff}
              />
            </div>{/* Corridor Staff */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <CorridorGrid />
              </div>
            </div></div>        )}
      </div>
    </div>    {/* Custom Staff Dialog */}
    <CustomStaffDialog
      isOpen={showCustomStaffDialog}
      form={customStaffForm}
      onFormChange={setCustomStaffForm}
      onSubmit={handleCustomStaffSubmit}
      onCancel={handleCustomStaffCancel}
    />
      
    <DragOverlay>
      {activeStaff ? (        <div className="bg-white shadow-lg rounded-lg border border-gray-200 cursor-move rotate-3 opacity-90">
          <div className="p-3">
            <h3 className="font-semibold text-sm">{activeStaff.name}</h3>
            <p className="text-xs text-gray-600">{activeStaff.workHours}</p>
          </div>
        </div>
      ) : null}
    </DragOverlay>
    </DndContext>
  );
}
