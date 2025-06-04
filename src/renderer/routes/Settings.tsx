import React from 'react';
import { useAppStore } from '../stores/appStore';
import type { OperatingRoom, CorridorRole, CorridorFunction, SwedishDay } from '../types';
import { SWEDISH_DAYS } from '../types';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const {
    getCurrentWeek,
    updateRoomSettings,
    updateCorridorSettings,
    isDashboardMode,
    setDashboardMode
  } = useAppStore();

  const currentWeek = getCurrentWeek();
  
  // State for managing which section is open
  const [activeSection, setActiveSection] = React.useState<'rooms' | 'corridors' | 'general'>('rooms');
  const [selectedDay, setSelectedDay] = React.useState<SwedishDay>(SWEDISH_DAYS[0]);
  
  // State for editing forms
  const [roomEditForm, setRoomEditForm] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  
  const [corridorEditForm, setCorridorEditForm] = React.useState<{
    roleId: string;
    roleName: string;
    functions: CorridorFunction[];
  } | null>(null);
  
  const [newFunctionForm, setNewFunctionForm] = React.useState({
    label: '',
    pager: '',
    comments: '',
    lunchRooms: ''
  });

  // Early return if dashboard mode is active
  if (isDashboardMode) {
    return null;
  }

  const selectedDayData = currentWeek?.days.find(d => d.dayName === selectedDay);

  const handleAddRoom = () => {
    if (!selectedDayData) return;
    
    const newRoomNumber = selectedDayData.rooms.length + 1;
    const newRoom: OperatingRoom = {
      id: `room-${newRoomNumber}`,
      name: `Sal ${newRoomNumber}`,
      staff: {}
    };
    
    updateRoomSettings(selectedDay, [...selectedDayData.rooms, newRoom]);
  };

  const handleRemoveRoom = (roomId: string) => {
    if (!selectedDayData) return;
    
    const updatedRooms = selectedDayData.rooms.filter(r => r.id !== roomId);
    updateRoomSettings(selectedDay, updatedRooms);
  };

  const handleUpdateRoomName = (roomId: string, newName: string) => {
    if (!selectedDayData) return;
    
    const updatedRooms = selectedDayData.rooms.map(room =>
      room.id === roomId ? { ...room, name: newName } : room
    );
    updateRoomSettings(selectedDay, updatedRooms);
    setRoomEditForm(null);
  };

  const handleAddCorridorRole = () => {
    if (!selectedDayData) return;
    
    const newRole: CorridorRole = {
      id: `corridor-${Date.now()}`,
      name: 'Ny Roll',
      functions: []
    };
    
    updateCorridorSettings(selectedDay, [...selectedDayData.corridorStaff, newRole]);
  };

  const handleRemoveCorridorRole = (roleId: string) => {
    if (!selectedDayData) return;
    
    const updatedRoles = selectedDayData.corridorStaff.filter(r => r.id !== roleId);
    updateCorridorSettings(selectedDay, updatedRoles);
  };

  const handleUpdateCorridorRole = (roleId: string, roleName: string, functions: CorridorFunction[]) => {
    if (!selectedDayData) return;
    
    const updatedRoles = selectedDayData.corridorStaff.map(role =>
      role.id === roleId ? { ...role, name: roleName, functions } : role
    );
    updateCorridorSettings(selectedDay, updatedRoles);
    setCorridorEditForm(null);
  };

  const handleAddFunction = (roleId: string) => {
    if (!corridorEditForm || corridorEditForm.roleId !== roleId) return;
    
    const lunchRoomsArray = newFunctionForm.lunchRooms
      .split(',')
      .map(room => room.trim())
      .filter(room => room.length > 0);
    
    const newFunction: CorridorFunction = {
      id: `fn-${Date.now()}`,
      label: newFunctionForm.label,
      pager: newFunctionForm.pager || undefined,
      comments: newFunctionForm.comments || undefined,
      lunchRooms: lunchRoomsArray.length > 0 ? lunchRoomsArray : undefined
    };
    
    const updatedFunctions = [...corridorEditForm.functions, newFunction];
    setCorridorEditForm({
      ...corridorEditForm,
      functions: updatedFunctions
    });
    
    setNewFunctionForm({
      label: '',
      pager: '',
      comments: '',
      lunchRooms: ''
    });
  };

  const handleRemoveFunction = (functionId: string) => {
    if (!corridorEditForm) return;
    
    const updatedFunctions = corridorEditForm.functions.filter(fn => fn.id !== functionId);
    setCorridorEditForm({
      ...corridorEditForm,
      functions: updatedFunctions
    });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inställningar</h1>          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Tillbaka till Planering
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveSection('rooms')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'rooms'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Operationssalar
            </button>
            <button
              onClick={() => setActiveSection('corridors')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'corridors'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Korridorsfunktioner
            </button>
            <button
              onClick={() => setActiveSection('general')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'general'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Allmänna inställningar
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day Selector (for rooms and corridors) */}
          {(activeSection === 'rooms' || activeSection === 'corridors') && (
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
              <div className="flex space-x-2">
                {SWEDISH_DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedDay === day
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeSection === 'rooms' && (
              <div className="max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Operationssalar för {selectedDay}
                  </h2>
                  <button
                    onClick={handleAddRoom}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    + Lägg till sal
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedDayData?.rooms.map(room => (
                    <div key={room.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        {roomEditForm?.id === room.id ? (
                          <div className="flex space-x-2 items-center flex-1">
                            <input
                              type="text"
                              value={roomEditForm.name}
                              onChange={(e) => setRoomEditForm({ ...roomEditForm, name: e.target.value })}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Salnamn"
                            />
                            <button
                              onClick={() => handleUpdateRoomName(room.id, roomEditForm.name)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              Spara
                            </button>
                            <button
                              onClick={() => setRoomEditForm(null)}
                              className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                            >
                              Avbryt
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-medium text-gray-900">{room.name}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setRoomEditForm({ id: room.id, name: room.name })}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Redigera
                              </button>
                              <button
                                onClick={() => handleRemoveRoom(room.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                                disabled={selectedDayData.rooms.length <= 1}
                              >
                                Ta bort
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Roller: Pass, Op SSK, Ane SSK, Student
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'corridors' && (
              <div className="max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Korridorsfunktioner för {selectedDay}
                  </h2>
                  <button
                    onClick={handleAddCorridorRole}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    + Lägg till roll
                  </button>
                </div>

                <div className="space-y-6">
                  {selectedDayData?.corridorStaff.map(role => (
                    <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {corridorEditForm?.roleId === role.id ? (
                        <div className="space-y-4">
                          <div className="flex space-x-2 items-center">
                            <input
                              type="text"
                              value={corridorEditForm.roleName}
                              onChange={(e) => setCorridorEditForm({ ...corridorEditForm, roleName: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded"
                              placeholder="Rollnamn"
                            />
                            <button
                              onClick={() => handleUpdateCorridorRole(role.id, corridorEditForm.roleName, corridorEditForm.functions)}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Spara roll
                            </button>
                            <button
                              onClick={() => setCorridorEditForm(null)}
                              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                            >
                              Avbryt
                            </button>
                          </div>

                          {/* Functions Management */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Funktioner</h4>
                            <div className="space-y-2 mb-4">
                              {corridorEditForm.functions.map(fn => (
                                <div key={fn.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                                  <div>
                                    <span className="font-medium">{fn.label}</span>
                                    {fn.pager && <span className="text-gray-500 ml-2">({fn.pager})</span>}
                                    {fn.comments && <span className="text-gray-500 ml-2">- {fn.comments}</span>}
                                    {fn.lunchRooms && fn.lunchRooms.length > 0 && (
                                      <span className="text-orange-600 ml-2">🍽 {fn.lunchRooms.join(', ')}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFunction(fn.id)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    Ta bort
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add New Function Form */}
                            <div className="bg-gray-50 p-3 rounded space-y-2">
                              <h5 className="text-sm font-medium text-gray-700">Lägg till funktion</h5>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Funktionsnamn (t.ex. 1301)"
                                  value={newFunctionForm.label}
                                  onChange={(e) => setNewFunctionForm({ ...newFunctionForm, label: e.target.value })}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                                />
                                <input
                                  type="text"
                                  placeholder="Personsökare (valfritt)"
                                  value={newFunctionForm.pager}
                                  onChange={(e) => setNewFunctionForm({ ...newFunctionForm, pager: e.target.value })}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Kommentarer (valfritt)"
                                value={newFunctionForm.comments}
                                onChange={(e) => setNewFunctionForm({ ...newFunctionForm, comments: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Lunchrum (kommaseparerade, t.ex. 3701, 3704)"
                                value={newFunctionForm.lunchRooms}
                                onChange={(e) => setNewFunctionForm({ ...newFunctionForm, lunchRooms: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              />
                              <button
                                onClick={() => handleAddFunction(role.id)}
                                disabled={!newFunctionForm.label.trim()}
                                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-400"
                              >
                                Lägg till funktion
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-gray-900">{role.name}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setCorridorEditForm({
                                  roleId: role.id,
                                  roleName: role.name,
                                  functions: role.functions
                                })}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Redigera
                              </button>
                              <button
                                onClick={() => handleRemoveCorridorRole(role.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                                disabled={selectedDayData.corridorStaff.length <= 1}
                              >
                                Ta bort
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {role.functions.length === 0 ? (
                              <span className="italic">Inga funktioner</span>
                            ) : (
                              <div className="space-y-1">
                                {role.functions.map(fn => (
                                  <div key={fn.id} className="flex items-center">
                                    <span className="font-medium">{fn.label}</span>
                                    {fn.pager && <span className="text-gray-400 ml-2">({fn.pager})</span>}
                                    {fn.lunchRooms && fn.lunchRooms.length > 0 && (
                                      <span className="text-orange-600 ml-2">🍽 {fn.lunchRooms.join(', ')}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'general' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Allmänna inställningar</h2>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Visningsinställningar</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isDashboardMode}
                          onChange={(e) => setDashboardMode(e.target.checked)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-700">Dashboardläge aktivt</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Information</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>• Operationssalar kan konfigureras individuellt för varje dag</p>
                      <p>• Varje sal stöder roller: Pass, Op SSK, Ane SSK, Student</p>
                      <p>• Korridorsfunktioner kan ha personsökare och lunchrum</p>
                      <p>• Maximalt 3 personal per roll i varje sal</p>
                      <p>• Endast 1 personal tillåten per korridorsfunktion</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}