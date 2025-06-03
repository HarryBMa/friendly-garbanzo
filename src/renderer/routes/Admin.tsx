import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '../stores/appStore';
import { sv } from '../i18n/sv';
import type { StaffMember } from '../types';

// Draggable Staff Card Component
function DraggableStaffCard({ staff }: { staff: StaffMember }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: staff.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white shadow-sm cursor-move hover:shadow-md transition-shadow rounded-lg border border-gray-200"
    >
      <div className="p-3">
        <h3 className="font-semibold text-sm">{staff.name}</h3>
        <p className="text-xs text-gray-600">{staff.workHours}</p>
        {staff.comments && (
          <p className="text-xs text-gray-500 italic">
            {staff.comments}
          </p>
        )}
      </div>
    </div>
  );
}

// Droppable Zone Component
function DroppableZone({ 
  id, 
  children, 
  className = ''
}: { 
  id: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  return (
    <div 
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-400 border-2' : 'border-2 border-dashed border-gray-300'} transition-colors rounded min-h-[60px]`}
    >
      {children}
    </div>
  );
}

export default function Admin() {  const { 
    currentWeekId, 
    currentDayId, 
    getCurrentDay, 
    getCurrentWeek,
    setCurrentDay,
    isDashboardMode,
    setDashboardMode,
    assignStaffToRoom,
    assignStaffToCorridor,
    unassignStaff,
    importStaff,
    importDualStaff
  } = useAppStore();

  const [activeStaff, setActiveStaff] = React.useState<StaffMember | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const currentDay = getCurrentDay();
  const currentWeek = getCurrentWeek();

  const handleDaySwitch = (dayId: string) => {
    setCurrentDay(dayId);
  };

  const toggleDashboardMode = () => {
    setDashboardMode(!isDashboardMode);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const staffMember = currentDay?.availableStaff.find(s => s.id === active.id);
    setActiveStaff(staffMember || null);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStaff(null);

    if (!over) return;

    const staffId = active.id as string;
    const dropId = over.id as string;

    // Parse drop target
    if (dropId.startsWith('room-')) {
      const [, roomId, role] = dropId.split('-');
      assignStaffToRoom(staffId, `room-${roomId}`, role);
    } else if (dropId.startsWith('corridor-')) {
      assignStaffToCorridor(staffId, dropId);
    }
  };  const handleImportExcel = async () => {
    try {
      const result = await window.electronAPI?.importExcel();
      if (result?.success && result.data.length > 0) {
        const staffWithIds = result.data.map((staff: any) => ({
          ...staff,
          id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isCustom: true
        }));
        importStaff(staffWithIds);
        
        // Show success message
        alert(`Importerade ${result.data.length} personal från Excel-fil`);
      } else {
        alert('Import misslyckades eller inga data hittades');
      }
    } catch (error) {
      console.error('Excel import error:', error);
      alert('Ett fel uppstod vid import av Excel-fil');
    }
  };

  const handleImportDualExcel = async () => {
    try {
      const result = await window.electronAPI?.importDualExcel();
      if (result?.success && result.data.length > 0) {
        const staffWithIds = result.data.map((staff: any) => ({
          ...staff,
          id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isCustom: false // These are from official Excel files
        }));
        
        // Use the new dual import with metadata
        importDualStaff(staffWithIds, {
          week: result.week,
          opFileName: result.opFileName,
          aneFileName: result.aneFileName
        });
        
        // Show detailed success message
        let message = `Importerade ${result.data.length} personal från OP- och ANE-filer\n`;
        message += `Vecka: ${result.week}\n`;
        message += `OP-fil: ${result.opFileName}\n`;
        message += `ANE-fil: ${result.aneFileName}`;
        
        if (result.warnings && result.warnings.length > 0) {
          message += `\n\nVarningar:\n${result.warnings.join('\n')}`;
        }
        
        alert(message);
      } else {
        const errorMsg = result?.errors?.join('\n') || 'Import misslyckades eller inga data hittades';
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Dual Excel import error:', error);
      alert('Ett fel uppstod vid import av Excel-filer');
    }  };
  const handleAddCustomStaff = () => {
    const name = prompt('Ange namn på personal:');
    if (!name || name.trim() === '') return;
    
    const workHours = prompt('Ange arbetstid (valfritt):') || '';
    const comments = prompt('Ange kommentarer (valfritt):') || '';
    
    const customStaff = {
      id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      workHours: workHours.trim(),
      comments: comments.trim(),
      isCustom: true
    };
    
    // Add to the current day's available staff directly
    const currentDay = getCurrentDay();
    if (currentDay) {
      currentDay.availableStaff.push(customStaff);
      alert(`Lade till ${customStaff.name} som tillfällig personal`);
    } else {
      alert('Ingen aktiv dag vald');
    }
  };

  if (isDashboardMode) {
    // Redirect to dashboard view
    return null;
  }
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
            <h1 className="text-xl font-bold">{sv.appTitle} - {sv.planning}</h1>
            <div className="flex gap-2">
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
      <div className="container mx-auto p-4">
        {/* Week Selector */}
        <div className="mb-4">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>                <select className="px-3 py-1 border border-gray-300 rounded text-sm bg-white max-w-xs">
                  <option value={currentWeekId}>
                    {currentWeek?.name || 'Aktuell vecka'}
                  </option>
                </select>
              </li>
            </ul>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="tabs tabs-bordered mb-6">
          {currentWeek?.days.map((day) => (
            <button
              key={day.id}
              className={`tab tab-lg ${currentDayId === day.id ? 'tab-active' : ''}`}
              onClick={() => handleDaySwitch(day.id)}
            >
              {day.dayName}
            </button>
          ))}
        </div>

        {/* Current Day Content */}
        {currentDay && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Available Staff Panel */}          <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="p-4">                  <h2 className="text-lg font-semibold">{sv.staff.available}</h2>
                    {/* Import/Add Controls */}
                  <div className="space-y-2 mb-4">
                    {/* Primary: Dual Import */}
                    <button 
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
                      onClick={handleImportDualExcel}
                      title="Importera både OP- och ANE-filer tillsammans"
                    >
                      {sv.actions.importDual}
                    </button>
                      {/* Secondary actions */}
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex-1"
                        onClick={handleImportExcel}
                        title="Importera en enskild Excel-fil"
                      >
                        {sv.actions.importSingle}
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex-1"
                        onClick={handleAddCustomStaff}
                        title="Lägg till tillfällig personal manuellt"
                      >
                        {sv.actions.add}
                      </button>
                    </div>
                  </div>{/* Staff List */}
                  <SortableContext 
                    items={currentDay.availableStaff.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {currentDay.availableStaff.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          {sv.messages.noStaffAvailable}
                        </div>
                      ) : (
                        currentDay.availableStaff.map((staff) => (
                          <DraggableStaffCard key={staff.id} staff={staff} />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </div>
              </div>
            </div>

            {/* Operating Rooms */}          <div className="lg:col-span-2">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{sv.rooms.operatingRoom}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {currentDay.rooms.map((room) => (
                      <div key={room.id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <div className="p-3">
                          <h3 className="text-base font-semibold">{room.name}</h3>
                          
                          {/* Role Slots */}
                          <div className="space-y-2">                            {/* Pass */}                            <DroppableZone id={`room-${room.id.split('-')[1]}-pass`}>
                              <div className="text-xs font-semibold text-gray-600 mb-1 p-2">
                                {sv.staff.pass}
                              </div>
                              {room.staff.pass ? (
                                <div className="bg-info text-info-content p-2 rounded text-xs m-2">
                                  <div className="font-semibold">{room.staff.pass.name}</div>
                                  <div className="text-xs opacity-80">{room.staff.pass.workHours}</div>                                  <button 
                                    onClick={() => unassignStaff(room.staff.pass!.id)}
                                    className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 float-right mt-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (                                <div className="text-center text-gray-400 text-xs py-2">
                                  Dra personal hit
                                </div>
                              )}
                            </DroppableZone>                            {/* Op SSK */}
                            <DroppableZone id={`room-${room.id.split('-')[1]}-opSSK`}>
                              <div className="text-xs font-semibold text-gray-600 mb-1 p-2">
                                {sv.staff.opSSK}
                              </div>
                              {room.staff.opSSK ? (
                                <div className="bg-success text-success-content p-2 rounded text-xs m-2">
                                  <div className="font-semibold">{room.staff.opSSK.name}</div>
                                  <div className="text-xs opacity-80">{room.staff.opSSK.workHours}</div>                                  <button 
                                    onClick={() => unassignStaff(room.staff.opSSK!.id)}
                                    className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 float-right mt-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (                                <div className="text-center text-gray-400 text-xs py-2">
                                  Dra personal hit
                                </div>
                              )}
                            </DroppableZone>                            {/* Ane SSK */}
                            <DroppableZone id={`room-${room.id.split('-')[1]}-aneSSK`}>
                              <div className="text-xs font-semibold text-gray-600 mb-1 p-2">
                                {sv.staff.aneSSK}
                              </div>
                              {room.staff.aneSSK ? (
                                <div className="bg-warning text-warning-content p-2 rounded text-xs m-2">
                                  <div className="font-semibold">{room.staff.aneSSK.name}</div>
                                  <div className="text-xs opacity-80">{room.staff.aneSSK.workHours}</div>                                  <button 
                                    onClick={() => unassignStaff(room.staff.aneSSK!.id)}
                                    className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 float-right mt-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 text-xs py-2">
                                  Dra personal hit
                                </div>
                              )}
                            </DroppableZone>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>            {/* Corridor Staff */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{sv.staff.corridor}</h2>
                    <div className="space-y-3">                    {currentDay.corridorStaff.map((role) => (
                      <DroppableZone key={role.id} id={`corridor-${role.id}`}>
                        <div className="text-sm font-semibold text-gray-600 mb-2 p-2">
                          {role.name}
                        </div>
                        {role.functions.length > 0 && role.functions[0].staff ? (
                          <div className="bg-purple-100 text-purple-800 p-2 rounded text-xs m-2">
                            <div className="font-semibold">{role.functions[0].staff.name}</div>
                            <div className="text-xs opacity-80">{role.functions[0].staff.workHours}</div>
                            <button 
                              onClick={() => {/* TODO: Implement unassign functionality */}}
                              className="px-1 py-1 text-xs bg-red-500 text-white rounded-full float-right mt-1 w-5 h-5 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-xs py-3">
                            Dra personal hit
                          </div>
                        )}
                      </DroppableZone>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>        )}
      </div>
    </div>
      
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
