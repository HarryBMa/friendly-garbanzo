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
}: StaffCardProps) {  const cardClass = `
    bg-white shadow-sm rounded cursor-move transition-all border border-gray-200
    ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
    ${isCompact ? 'p-1' : 'p-3'}
  `;

  const textSize = isCompact ? 'text-[11px]' : 'text-sm';
  const nameSize = isCompact ? 'text-xs' : 'text-base';

  return (
    <div className={cardClass} draggable>
      {/* Staff Name */}
      <div className="flex items-start justify-between">
        <h3 className={`font-semibold text-gray-900 ${nameSize} leading-tight truncate`}>
          {staff.name}
        </h3>
          {showActions && (
          <div className="relative">
            <div tabIndex={0} role="button" className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
              ⋮
            </div>
            <ul tabIndex={0} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-32 p-2 hidden focus-within:block hover:block">
              {onEdit && (
                <li>
                  <button 
                    className="text-xs w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                    onClick={() => onEdit(staff)}
                  >
                    Redigera
                  </button>
                </li>
              )}
              {onRemove && (
                <li>
                  <button 
                    className="text-xs w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-red-600"
                    onClick={() => onRemove(staff.id)}
                  >
                    Ta bort
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>      {/* Work Hours */}
      {staff.workHours && (
        <div className={`text-gray-600 ${textSize} ${isCompact ? 'mt-0.5' : 'mt-1'}`}>
          {staff.workHours}
        </div>
      )}

      {/* Comments */}
      {staff.comments && (
        <div className={`text-gray-500 italic ${isCompact ? 'text-[10px] mt-0.5' : 'text-xs mt-1'} line-clamp-2`}>
          {staff.comments}
        </div>
      )}

      {/* Custom staff indicator */}
      {staff.isCustom && (
        <div className={isCompact ? 'mt-1' : 'mt-2'}>
          <span className={`inline-block px-2 py-1 text-xs border border-gray-300 rounded-full ${isCompact ? 'text-[10px] px-1' : ''}`}>
            Manuell
          </span>
        </div>
      )}
    </div>
  );
}
