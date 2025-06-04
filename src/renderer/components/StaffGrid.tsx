import DroppableCell from './DroppableCell';
import type { StaffMember } from '../types';

interface StaffColumn {
  id: string;
  pager: string;
  function: string;
}

interface StaffGridProps {
  title: string;
  columns: StaffColumn[];
  assignments: Record<string, StaffMember>;
  extraStaffCount?: number;
  onAddExtraStaff: () => void;
  onRemoveExtraStaff?: () => void;
}

export default function StaffGrid({ 
  title, 
  columns, 
  assignments, 
  extraStaffCount = 0, 
  onAddExtraStaff,
  onRemoveExtraStaff
}: StaffGridProps) {
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold text-gray-800 mb-3">{title}</h3>
      
      {/* Main grid */}
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((column) => (
          <DroppableCell
            key={column.id}
            id={column.id}
            pager={column.pager}
            functionText={column.function}
            assignedStaff={assignments[column.id]}
          />
        ))}
      </div>

      {/* Extra corridor staff rows */}
      {extraStaffCount > 0 && (
        <div className="space-y-2">
          {Array.from({ length: extraStaffCount }, (_, index) => (
            <div key={`extra-${index}`} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
              {columns.map((column) => (
                <DroppableCell
                  key={`${column.id}-extra-${index}`}
                  id={`${column.id}-extra-${index}`}
                  assignedStaff={assignments[`${column.id}-extra-${index}`]}
                  isExtraRow={true}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Add/Remove extra staff buttons */}
      <div className="mt-2 flex gap-2">
        <button
          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          onClick={onAddExtraStaff}
        >
          + Lägg till extra korridor personal
        </button>
        
        {onRemoveExtraStaff && extraStaffCount > 0 && (
          <button
            className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
            onClick={onRemoveExtraStaff}
          >
            - Ta bort extra personal
          </button>
        )}
      </div>
    </div>
  );
}
