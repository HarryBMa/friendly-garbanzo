import type { OperatingRoom } from '../types';
import { sv } from '../i18n/sv';

interface RoomCardProps {
  room: OperatingRoom;
  isCompact?: boolean;
}

export default function RoomCard({ room, isCompact = false }: RoomCardProps) {
  const cardClass = isCompact 
    ? "bg-gray-50 shadow-sm rounded-md p-1 min-h-0 border border-gray-200"
    : "bg-gray-50 shadow-sm rounded-md p-2 h-full border border-gray-200";

  const textSize = isCompact ? "text-[11px]" : "text-sm";
  const titleSize = isCompact ? "text-xs" : "text-base";

  return (
    <div className={cardClass}>
      {/* Room Header */}
      <div className={isCompact ? "mb-1" : "mb-2"}>
        <h3 className={`font-semibold text-gray-900 ${titleSize} leading-tight truncate`}>
          {room.name}
        </h3>
      </div>

      {/* Staff Roles */}
      <div className={`${isCompact ? 'space-y-0.5' : 'space-y-1'} flex-1`}>        {/* Pass */}
        <div className="min-h-0">
          <div className={`text-gray-600 font-medium ${textSize} ${isCompact ? 'mb-0.5' : 'mb-1'}`}>{sv.staff.pass}</div>
          {(room.staff.pass && room.staff.pass.length > 0) ? (
            <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
              {room.staff.pass.map((staff) => (
                <div key={staff.id} className={`bg-blue-100 text-blue-800 rounded ${isCompact ? 'p-0.5' : 'p-1'}`}>
                  <div className={`font-semibold ${textSize} leading-tight truncate`}>{staff.name}</div>
                  <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>{staff.workHours}</div>
                </div>
              ))}
              {/* Empty slots if less than 3 */}
              {Array.from({ length: 3 - room.staff.pass.length }).map((_, i) => (
                <div key={`empty-pass-${i}`} className={`text-center text-gray-400 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>—</div>
              ))}
            </div>
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`empty-pass-${i}`} className={`text-center text-gray-400 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>—</div>
            ))
          )}
        </div>

        {/* Op SSK */}
        <div className="min-h-0">
          <div className={`text-gray-600 font-medium ${textSize} ${isCompact ? 'mb-0.5' : 'mb-1'}`}>{sv.staff.opSSK}</div>
          {(room.staff.opSSK && room.staff.opSSK.length > 0) ? (
            <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
              {room.staff.opSSK.map((staff) => (
                <div key={staff.id} className={`bg-green-100 text-green-800 rounded ${isCompact ? 'p-0.5' : 'p-1'}`}>
                  <div className={`font-semibold ${textSize} leading-tight truncate`}>{staff.name}</div>
                  <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>{staff.workHours}</div>
                </div>
              ))}
              {Array.from({ length: 3 - room.staff.opSSK.length }).map((_, i) => (
                <div key={`empty-opSSK-${i}`} className={`text-center text-gray-400 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>—</div>
              ))}
            </div>
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`empty-opSSK-${i}`} className={`text-center text-gray-400 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>—</div>
            ))
          )}
        </div>

        {/* Ane SSK */}
        <div className="min-h-0">
          <div className={`text-gray-600 font-medium ${textSize} ${isCompact ? 'mb-0.5' : 'mb-1'}`}>{sv.staff.aneSSK}</div>
          {(room.staff.aneSSK && room.staff.aneSSK.length > 0) ? (
            <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
              {room.staff.aneSSK.map((staff) => (
                <div key={staff.id} className={`bg-yellow-100 text-yellow-800 rounded ${isCompact ? 'p-0.5' : 'p-1'}`}>
                  <div className={`font-semibold ${textSize} leading-tight truncate`}>{staff.name}</div>
                  <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>{staff.workHours}</div>
                </div>
              ))}
              {Array.from({ length: 3 - room.staff.aneSSK.length }).map((_, i) => (
                <div key={`empty-aneSSK-${i}`} className={`text-center text-gray-400 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>—</div>
              ))}
            </div>
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`empty-aneSSK-${i}`} className={`text-center text-gray-400 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>—</div>
            ))
          )}
        </div>

        {/* Students (if any) */}
        {room.staff.students && room.staff.students.length > 0 && (
          <div className="min-h-0">
            <div className={`text-gray-600 font-medium ${textSize} ${isCompact ? 'mb-0.5' : 'mb-1'}`}>{sv.staff.student}</div>
            <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
              {room.staff.students.map((student) => (
                <div key={student.id} className={`bg-gray-100 text-gray-800 rounded ${isCompact ? 'p-0.5' : 'p-1'}`}>
                  <div className={`font-semibold ${textSize} leading-tight truncate`}>{student.name}</div>
                  <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>{student.workHours}</div>
                </div>
              ))}
              {Array.from({ length: 3 - room.staff.students.length }).map((_, i) => (
                <div key={`empty-student-${i}`} className={`text-center text-gray-400 ${isCompact ? 'text-[10px]' : 'text-xs'} py-1`}>—</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
