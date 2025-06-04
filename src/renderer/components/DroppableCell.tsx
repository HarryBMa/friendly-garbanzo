import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { StaffMember } from '../types';

interface DroppableCellProps {
  id: string;
  pager?: string;
  functionText?: string;
  assignedStaff?: StaffMember | null;
  isExtraRow?: boolean;
}

export default function DroppableCell({ 
  id, 
  pager, 
  functionText, 
  assignedStaff, 
  isExtraRow = false 
}: DroppableCellProps) {
  const { isOver, setNodeRef: setDropNodeRef } = useDroppable({ id });
  
  // Make assigned staff draggable
  const sortable = useSortable({ 
    id: assignedStaff ? `corridor-${assignedStaff.id}` : id,
    disabled: !assignedStaff 
  });

  return (
    <div
      ref={setDropNodeRef}
      className={`
        border-2 border-dashed transition-colors rounded min-h-[80px] p-2
        ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
      `}
    >
      {!isExtraRow && (
        <div className="text-xs font-medium text-gray-700 mb-1">
          {pager && <div>{pager}</div>}
          {functionText && <div className="text-gray-500">{functionText}</div>}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        {assignedStaff ? (          <div
            ref={sortable.setNodeRef}
            style={{
              transform: CSS.Transform.toString(sortable.transform),
            }}
            {...sortable.attributes}
            {...sortable.listeners}
            className={`text-sm font-medium text-gray-900 text-center bg-blue-100 p-2 rounded cursor-move ${
              sortable.isDragging ? 'opacity-50' : ''
            }`}
          >
            <div className="font-semibold">{assignedStaff.name}</div>
            {assignedStaff.workHours && (
              <div className="text-xs text-gray-600">{assignedStaff.workHours}</div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-xs">
            {isExtraRow ? 'Extra korridor personal' : 'Ingen tilldelad'}
          </div>
        )}
      </div>
    </div>
  );
}
