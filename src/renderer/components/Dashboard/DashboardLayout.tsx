import type { DaySchedule } from '../../types';
import RoomCard from '../RoomCard.tsx';
import CorridorStaffGrid from '../CorridorStaffGrid.tsx';

interface DashboardLayoutProps {
  day: DaySchedule;
}

export default function DashboardLayout({ day }: DashboardLayoutProps) {
  return (
    <div className="h-[calc(100vh-120px)] w-full overflow-hidden">
      {/* 16:9 Optimized Layout */}
      <div className="grid grid-cols-5 h-full gap-1">
        {/* Operating Rooms - Takes most space */}
        <div className="col-span-3 bg-base-100 rounded-lg overflow-hidden">
          <div className="p-2 bg-primary text-primary-content">
            <h2 className="text-sm font-semibold">Operationssalar</h2>
          </div>
          
          <div className="p-2 h-[calc(100%-2.5rem)] overflow-hidden">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-1 h-full">
              {day.rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </div>

        {/* Corridor Staff */}
        <div className="col-span-1 bg-base-100 rounded-lg overflow-hidden">
          <div className="p-2 bg-secondary text-secondary-content">
            <h2 className="text-sm font-semibold">Korridorpersonal</h2>
          </div>
          
          <div className="p-2 h-[calc(100%-2.5rem)] overflow-hidden">
            <CorridorStaffGrid corridorStaff={day.corridorStaff} />
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="col-span-1 bg-base-100 rounded-lg overflow-hidden">
          <div className="p-2 bg-accent text-accent-content">
            <h2 className="text-sm font-semibold">Information</h2>          </div>
        </div>
      </div>
    </div>
  );
}
