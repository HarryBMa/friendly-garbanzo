import type { CorridorRole } from '../types';
import { DroppableZone } from './shared';

interface CorridorStaffGridProps {
  corridorStaff: CorridorRole[];
  isCompact?: boolean;
}

export default function CorridorStaffGrid({ corridorStaff, isCompact = false }: CorridorStaffGridProps) {
  const spacing = isCompact ? 'gap-1' : 'gap-2';
  const padding = isCompact ? 'p-1' : 'p-2';
  const titleSize = isCompact ? 'text-xs' : 'text-sm';
  const textSize = isCompact ? 'text-[11px]' : 'text-xs';
  const smallTextSize = isCompact ? 'text-[10px]' : 'text-[11px]';

  return (
    <div className={`h-full grid grid-cols-1 md:grid-cols-3 ${spacing} overflow-y-auto`}>      {/* Extra/Blank corridor staff droppable box */}
      <div className={`bg-gray-100 ${padding} rounded flex flex-col mb-2 col-span-3`}>
        <DroppableZone id={`corridor-extra`} minHeight="min-h-[40px]">
          <div className={`${titleSize} font-semibold text-gray-700 mb-1`}>Extra/Blank (Ej tilldelad funktion)</div>
          {/* Render unassigned corridor staff here if needed */}
          <div className={`text-center text-gray-400 ${smallTextSize} ${isCompact ? 'py-1' : 'py-2'}`}>Dra personal hit</div>
        </DroppableZone>
      </div>
      {corridorStaff.map((role) => (
        <div key={role.id} className={`bg-gray-200 ${padding} rounded min-h-0 flex flex-col`}>
          {/* Role Header */}
          <h3 className={`${titleSize} font-semibold text-gray-900 mb-1 truncate`}>
            {role.name}
          </h3>

          {/* Functions List */}
          <div className={`space-y-1 flex-1 min-h-0 overflow-y-auto`}>            {role.functions.map((fn) => (
              <DroppableZone key={fn.id} id={`corridor-fn-${fn.id}`} minHeight="min-h-[40px]">
                {/* Function Label */}
                <div className={`${textSize} font-medium mb-1 truncate text-gray-900`}>
                  {fn.label}
                </div>                {/* Staff Assignment */}
                {fn.staff ? (
                  <div className={`${textSize} leading-tight space-y-1`}>
                    <div className="bg-gray-50 rounded p-1 mb-1 flex flex-col">
                      <div className="font-semibold truncate text-gray-900">{fn.staff.name}</div>
                      {fn.staff.workHours && (
                        <div className="text-gray-600 truncate">{fn.staff.workHours}</div>
                      )}
                      
                      {/* Pager and Lunch indicators */}
                      <div className="flex items-center gap-1 mt-1">
                        {fn.pager && (
                          <span className={`inline-flex items-center px-1 py-0.5 rounded text-blue-700 bg-blue-100 ${smallTextSize} font-medium`}>
                            📞 {fn.pager}
                          </span>
                        )}
                        {fn.lunchRooms && fn.lunchRooms.length > 0 && (
                          <span className={`inline-flex items-center px-1 py-0.5 rounded text-green-700 bg-green-100 ${smallTextSize} font-medium`}>
                            🍽 {fn.lunchRooms.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className={`text-center text-gray-400 ${smallTextSize} ${isCompact ? 'py-1' : 'py-2'}`}>Ingen tilldelad</div>
                    
                    {/* Show function-specific indicators even when no staff assigned */}
                    <div className="flex items-center gap-1 justify-center">
                      {fn.pager && (
                        <span className={`inline-flex items-center px-1 py-0.5 rounded text-blue-600 bg-blue-50 ${smallTextSize} font-medium opacity-60`}>
                          📞 {fn.pager}
                        </span>
                      )}
                      {fn.lunchRooms && fn.lunchRooms.length > 0 && (
                        <span className={`inline-flex items-center px-1 py-0.5 rounded text-green-600 bg-green-50 ${smallTextSize} font-medium opacity-60`}>
                          🍽 {fn.lunchRooms.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </DroppableZone>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
