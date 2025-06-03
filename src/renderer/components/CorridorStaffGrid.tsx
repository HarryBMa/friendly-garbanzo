import type { CorridorRole } from '../types';

interface CorridorStaffGridProps {
  corridorStaff: CorridorRole[];
  isCompact?: boolean;
}

export default function CorridorStaffGrid({ corridorStaff, isCompact = false }: CorridorStaffGridProps) {
  const spacing = isCompact ? 'gap-1' : 'gap-2';
  const padding = isCompact ? 'p-1' : 'p-2';
  const innerPadding = isCompact ? 'p-1' : 'p-2';
  const titleSize = isCompact ? 'text-xs' : 'text-sm';
  const textSize = isCompact ? 'text-[11px]' : 'text-xs';
  const smallTextSize = isCompact ? 'text-[10px]' : 'text-[11px]';

  return (
    <div className={`h-full grid grid-cols-1 md:grid-cols-3 ${spacing} overflow-y-auto`}>
      {corridorStaff.map((role) => (
        <div key={role.id} className={`bg-gray-200 ${padding} rounded min-h-0 flex flex-col`}>
          {/* Role Header */}
          <h3 className={`${titleSize} font-semibold text-gray-900 mb-1 truncate`}>
            {role.name}
          </h3>

          {/* Functions List */}
          <div className={`space-y-1 flex-1 min-h-0 overflow-y-auto`}>
            {role.functions.map((fn) => (
              <div key={fn.id} className={`bg-white ${innerPadding} rounded shadow-sm`}>
                {/* Function Label */}
                <div className={`${textSize} font-medium mb-1 truncate text-gray-900`}>
                  {fn.label}
                </div>

                {/* Staff Assignment */}
                {fn.staff ? (
                  <div className={`${textSize} leading-tight`}>
                    {/* Staff Name */}
                    <div className="font-semibold truncate text-gray-900">
                      {fn.staff.name}
                    </div>
                    
                    {/* Work Hours */}
                    <div className="text-gray-600 truncate">
                      {fn.staff.workHours}
                    </div>

                    {/* Pager Number */}
                    {fn.staff.pager && (
                      <div className={`${smallTextSize} text-gray-500 truncate`}>
                        Sökare: {fn.staff.pager}
                      </div>
                    )}

                    {/* Lunch Coverage Badges */}
                    {fn.staff.lunchRooms && fn.staff.lunchRooms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {fn.staff.lunchRooms.map((room, i) => (
                          <span
                            key={i}
                            className={`bg-amber-200 text-amber-900 ${smallTextSize} px-1 py-0.5 rounded-full flex-shrink-0`}
                          >
                            🍽 {room}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comments */}
                    {fn.staff.comments && (
                      <div className={`italic ${smallTextSize} text-gray-400 mt-1 truncate`}>
                        {fn.staff.comments}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`text-center text-gray-400 ${smallTextSize} ${isCompact ? 'py-1' : 'py-2'}`}>
                    Ingen tilldelad
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
