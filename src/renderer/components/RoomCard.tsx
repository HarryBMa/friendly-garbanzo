import type { OperatingRoom } from '../types';
import { sv } from '../i18n/sv';

interface RoomCardProps {
  room: OperatingRoom;
  isCompact?: boolean;
}

export default function RoomCard({ room, isCompact = false }: RoomCardProps) {
  const cardClass = isCompact 
    ? "bg-base-200 shadow-sm rounded-md p-1 min-h-0"
    : "bg-base-200 shadow-sm rounded-md p-2 h-full";

  const textSize = isCompact ? "text-xs" : "text-sm";
  const titleSize = isCompact ? "text-sm" : "text-base";

  return (
    <div className={cardClass}>
      {/* Room Header */}
      <div className="mb-2">
        <h3 className={`font-semibold text-base-content ${titleSize}`}>
          {room.name}
        </h3>
      </div>

      {/* Staff Roles */}
      <div className="space-y-1 flex-1">
        {/* Pass */}
        <div className="min-h-0">
          <div className={`text-base-content/70 font-medium ${textSize} mb-1`}>
            {sv.staff.pass}
          </div>
          {room.staff.pass ? (
            <div className="bg-info text-info-content p-1 rounded">
              <div className={`font-semibold ${textSize} leading-tight truncate`}>
                {room.staff.pass.name}
              </div>
              <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>
                {room.staff.pass.workHours}
              </div>
            </div>
          ) : (
            <div className={`text-center text-base-content/40 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>
              —
            </div>
          )}
        </div>

        {/* Op SSK */}
        <div className="min-h-0">
          <div className={`text-base-content/70 font-medium ${textSize} mb-1`}>
            {sv.staff.opSSK}
          </div>
          {room.staff.opSSK ? (
            <div className="bg-success text-success-content p-1 rounded">
              <div className={`font-semibold ${textSize} leading-tight truncate`}>
                {room.staff.opSSK.name}
              </div>
              <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>
                {room.staff.opSSK.workHours}
              </div>
            </div>
          ) : (
            <div className={`text-center text-base-content/40 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>
              —
            </div>
          )}
        </div>

        {/* Ane SSK */}
        <div className="min-h-0">
          <div className={`text-base-content/70 font-medium ${textSize} mb-1`}>
            {sv.staff.aneSSK}
          </div>
          {room.staff.aneSSK ? (
            <div className="bg-warning text-warning-content p-1 rounded">
              <div className={`font-semibold ${textSize} leading-tight truncate`}>
                {room.staff.aneSSK.name}
              </div>
              <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>
                {room.staff.aneSSK.workHours}
              </div>
            </div>
          ) : (
            <div className={`text-center text-base-content/40 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>
              —
            </div>
          )}
        </div>

        {/* Students (if any) */}
        {room.staff.students && room.staff.students.length > 0 && (
          <div className="min-h-0">
            <div className={`text-base-content/70 font-medium ${textSize} mb-1`}>
              {sv.staff.student}
            </div>
            <div className="space-y-1">
              {room.staff.students.map((student) => (
                <div key={student.id} className="bg-neutral text-neutral-content p-1 rounded">
                  <div className={`font-semibold ${textSize} leading-tight truncate`}>
                    {student.name}
                  </div>
                  <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>
                    {student.workHours}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>  );
}
