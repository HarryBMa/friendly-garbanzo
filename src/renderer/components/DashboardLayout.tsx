import type { DaySchedule } from '../types/index.ts';
import RoomCard from './RoomCard.tsx';
import CorridorStaffGrid from './CorridorStaffGrid.tsx';

interface DashboardLayoutProps {
  day: DaySchedule;
}

export default function DashboardLayout({ day }: DashboardLayoutProps) {
  // Enable compact mode when there are 6 or more rooms
  const compact = day.rooms.length >= 6;

  return (
    <div className="h-[calc(100vh-120px)] w-full overflow-hidden">
      <div className="grid grid-rows-[65%_35%] grid-cols-[auto_260px] h-full gap-1">
        
        {/* OR Rooms */}
        <div className="bg-white rounded-lg overflow-hidden col-start-1 row-start-1">
          <div className="p-2 bg-primary text-primary-content">
            <h2 className="text-sm font-semibold">Operationssalar</h2>
          </div>
          <div className="p-2 h-[calc(100%-2.5rem)] overflow-hidden">
            <div className={`grid grid-cols-2 xl:grid-cols-3 h-full ${
              compact ? 'gap-[2px]' : 'gap-1'
            }`}>
              {day.rooms.map((room) => (
                <RoomCard key={room.id} room={room} isCompact={compact} />
              ))}
            </div>
          </div>
        </div>

        {/* Corridor Staff */}
        <div className="bg-white rounded-lg overflow-hidden col-start-1 row-start-2">
          <div className="p-2 bg-secondary text-secondary-content">
            <h2 className="text-sm font-semibold">Korridorpersonal</h2>
          </div>
          <div className="p-2 h-[calc(100%-2.5rem)] overflow-hidden">
            <CorridorStaffGrid corridorStaff={day.corridorStaff} isCompact={compact} />
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="bg-white rounded-lg overflow-hidden col-start-2 row-span-2">
          <div className="p-2 bg-accent text-accent-content">
            <h2 className="text-sm font-semibold">Information</h2>
          </div>
          <div className="p-2 text-sm text-gray-600">
            {/* You can put dynamic content or day switcher here */}
            Välj veckodag eller se detaljinformation.
          </div>
        </div>

      </div>
    </div>
  );
}
