import type { StaffMember } from '../types';

interface StaffCardProps {
  staff: StaffMember;
  isDragging?: boolean;
  isCompact?: boolean;
  showActions?: boolean;
  onEdit?: (staff: StaffMember) => void;
  onRemove?: (staffId: string) => void;
}

export default function StaffCard({ 
  staff, 
  isDragging = false, 
  isCompact = false,
  showActions = false,
  onEdit,
  onRemove 
}: StaffCardProps) {
  const cardClass = `
    bg-base-100 shadow-sm rounded cursor-move transition-all
    ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
    ${isCompact ? 'p-2' : 'p-3'}
  `;

  const textSize = isCompact ? 'text-xs' : 'text-sm';
  const nameSize = isCompact ? 'text-sm' : 'text-base';

  return (
    <div className={cardClass} draggable>
      {/* Staff Name */}
      <div className="flex items-start justify-between">
        <h3 className={`font-semibold text-base-content ${nameSize} leading-tight`}>
          {staff.name}
        </h3>
        
        {showActions && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">
              ⋮
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow">
              {onEdit && (
                <li>
                  <button 
                    className="text-xs"
                    onClick={() => onEdit(staff)}
                  >
                    Redigera
                  </button>
                </li>
              )}
              {onRemove && (
                <li>
                  <button 
                    className="text-xs text-error"
                    onClick={() => onRemove(staff.id)}
                  >
                    Ta bort
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Work Hours */}
      {staff.workHours && (
        <div className={`text-base-content/70 ${textSize} mt-1`}>
          {staff.workHours}
        </div>
      )}

      {/* Comments */}
      {staff.comments && (
        <div className={`text-base-content/60 italic ${isCompact ? 'text-[10px]' : 'text-xs'} mt-1 line-clamp-2`}>
          {staff.comments}
        </div>
      )}

      {/* Custom staff indicator */}
      {staff.isCustom && (
        <div className="mt-2">
          <span className="badge badge-sm badge-outline">
            Manuell
          </span>
        </div>
      )}
    </div>
  );
}
