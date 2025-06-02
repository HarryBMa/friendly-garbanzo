import type { CorridorRole } from '../types';

interface CorridorStaffGridProps {
  corridorStaff: CorridorRole[];
  isCompact?: boolean;
}

export default function CorridorStaffGrid({ corridorStaff, isCompact = false }: CorridorStaffGridProps) {
  const textSize = isCompact ? 'text-xs' : 'text-sm';
  const titleSize = isCompact ? 'text-sm' : 'text-base';

  return (
    <div className="space-y-2 h-full overflow-y-auto">
      {corridorStaff.map((role) => (
        <div key={role.id} className="bg-base-300 rounded p-2 min-h-0">
          <div className={`font-semibold text-base-content ${titleSize} mb-1 truncate`}>
            {role.name}
          </div>
          
          {role.staff ? (
            <div className="bg-accent text-accent-content p-2 rounded">
              <div className={`font-semibold ${textSize} leading-tight truncate`}>
                {role.staff.name}
              </div>
              <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-80 truncate`}>
                {role.staff.workHours}
              </div>
              {role.staff.comments && (
                <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} opacity-70 italic truncate mt-1`}>
                  {role.staff.comments}
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center text-base-content/40 ${isCompact ? 'text-[10px]' : 'text-xs'} py-3`}>
              Ingen tilldelad
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
