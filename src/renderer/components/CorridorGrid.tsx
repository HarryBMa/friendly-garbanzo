import { useAppStore } from '../stores/appStore';
import { DroppableZone } from './shared';

interface CorridorGridProps {
  className?: string;
}

export default function CorridorGrid({ className = '' }: CorridorGridProps) {
  const getCurrentDay = useAppStore(state => state.getCurrentDay);
  const currentDay = getCurrentDay();

  if (!currentDay) {
    return (
      <div className={`p-4 ${className}`}>
        <h2 className="text-lg font-semibold mb-4">Korridor Personal</h2>
        <div className="text-center text-gray-500 py-8">
          Ingen dag vald
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Korridor Personal</h2>
      
      {/* Extra/Blank corridor staff droppable box */}
      <div className="bg-gray-100 p-3 rounded mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Extra/Blank (Ej tilldelad funktion)</h3>
        <DroppableZone id="corridor-extra" minHeight="min-h-[60px]">
          <div className="text-center text-gray-400 text-xs py-2">Dra personal hit</div>
        </DroppableZone>
      </div>

      {/* Corridor Roles */}
      <div className="space-y-6">
        {currentDay.corridorStaff.map((role) => (
          <div key={role.id} className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">{role.name}</h3>
              
              {/* Functions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {role.functions.map((fn) => (
                  <DroppableZone key={fn.id} id={`corridor-fn-${fn.id}`} minHeight="min-h-[80px]">
                    <div className="p-2">
                      {/* Function Label */}
                      <div className="text-xs font-medium mb-1 text-gray-700">
                        {fn.label}
                        {fn.pager && (
                          <span className="ml-2 inline-flex items-center px-1 py-0.5 rounded text-blue-700 bg-blue-100 text-[10px] font-medium">
                            📞 {fn.pager}
                          </span>
                        )}
                      </div>
                      
                      {/* Staff Assignment */}
                      {fn.staff ? (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                          <div className="font-semibold text-gray-900">{fn.staff.name}</div>
                          {fn.staff.workHours && (
                            <div className="text-gray-600 mt-1">{fn.staff.workHours}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-xs py-3 border-2 border-dashed border-gray-200 rounded">
                          Dra personal hit
                        </div>
                      )}
                    </div>
                  </DroppableZone>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
