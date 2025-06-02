import type { DaySchedule } from '../types';
import { formatDate, getWeekNumber } from '../utils/dateHelpers';

interface SidebarPanelProps {
  day: DaySchedule;
}

export default function SidebarPanel({ day }: SidebarPanelProps) {
  const totalStaff = day.availableStaff.length;
  const assignedToRooms = day.rooms.reduce((count, room) => {
    return count + 
      (room.staff.pass ? 1 : 0) +
      (room.staff.opSSK ? 1 : 0) +
      (room.staff.aneSSK ? 1 : 0) +
      (room.staff.students?.length || 0);
  }, 0);
  const assignedToCorridor = day.corridorStaff.filter(role => role.staff).length;
  const unassigned = totalStaff - assignedToRooms - assignedToCorridor;

  return (
    <div className="space-y-4 text-xs">
      {/* Date Information */}
      <div className="bg-base-300 p-2 rounded">
        <h3 className="font-semibold text-sm mb-1">{day.dayName}</h3>
        <div className="space-y-1 text-xs">
          <div>{formatDate(day.date)}</div>
          <div>Vecka {getWeekNumber(day.date)}</div>
        </div>
      </div>

      {/* Staff Summary */}
      <div className="bg-base-300 p-2 rounded">
        <h3 className="font-semibold text-sm mb-2">Personalöversikt</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Total personal:</span>
            <span className="font-semibold">{totalStaff}</span>
          </div>
          <div className="flex justify-between">
            <span>I salar:</span>
            <span className="text-success font-semibold">{assignedToRooms}</span>
          </div>
          <div className="flex justify-between">
            <span>I korridor:</span>
            <span className="text-info font-semibold">{assignedToCorridor}</span>
          </div>
          <div className="flex justify-between">
            <span>Otilldelad:</span>
            <span className={`font-semibold ${unassigned > 0 ? 'text-warning' : 'text-success'}`}>
              {unassigned}
            </span>
          </div>
        </div>
      </div>

      {/* Room Status */}
      <div className="bg-base-300 p-2 rounded">
        <h3 className="font-semibold text-sm mb-2">Salstatus</h3>
        <div className="space-y-1">
          {day.rooms.map((room) => {
            const staffCount = 
              (room.staff.pass ? 1 : 0) +
              (room.staff.opSSK ? 1 : 0) +
              (room.staff.aneSSK ? 1 : 0) +
              (room.staff.students?.length || 0);
            
            const isFullyStaffed = room.staff.pass && room.staff.opSSK && room.staff.aneSSK;
            
            return (
              <div key={room.id} className="flex justify-between items-center">
                <span>{room.name}:</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">{staffCount}/3+</span>
                  <span 
                    className={`w-2 h-2 rounded-full ${
                      isFullyStaffed ? 'bg-success' : 
                      staffCount > 0 ? 'bg-warning' : 'bg-error'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corridor Status */}
      <div className="bg-base-300 p-2 rounded">
        <h3 className="font-semibold text-sm mb-2">Korridorstatus</h3>
        <div className="space-y-1">
          {day.corridorStaff.map((role) => (
            <div key={role.id} className="flex justify-between items-center">
              <span className="truncate flex-1 mr-2">{role.name}:</span>
              <span 
                className={`w-2 h-2 rounded-full ${
                  role.staff ? 'bg-success' : 'bg-error'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-base-300 p-2 rounded">
        <h3 className="font-semibold text-sm mb-2">Snabbåtgärder</h3>
        <div className="space-y-1">
          <button className="btn btn-xs btn-block">
            Kopiera schema
          </button>
          <button className="btn btn-xs btn-block">
            Rensa dag
          </button>
        </div>
      </div>
    </div>
  );
}
