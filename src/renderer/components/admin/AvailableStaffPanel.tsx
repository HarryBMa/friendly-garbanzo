import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { sv } from '../../i18n/sv';
import type { StaffMember } from '../../types';
import { SortableStaffItem } from '../shared';

interface AvailableStaffPanelProps {
  availableStaff: StaffMember[];
  staffFilter: string;
  workHoursFilter: string;
  onStaffFilterChange: (filter: string) => void;
  onWorkHoursFilterChange: (filter: string) => void;
  onImportExcel?: () => void;
  onAddCustomStaff: () => void;
  onClearAvailableStaff: () => void;
  onUpdateStaff: (staffId: string, updates: Partial<StaffMember>) => void;
  onRemoveStaff: (staffId: string) => void;
}

/**
 * Panel component for managing available staff including import, filtering, and display.
 * Features drag-and-drop staff management with filtering and CRUD operations.
 */
export default function AvailableStaffPanel({
  availableStaff,
  staffFilter,
  workHoursFilter,
  onStaffFilterChange,
  onWorkHoursFilterChange,
  onImportExcel,
  onAddCustomStaff,
  onClearAvailableStaff,
  onUpdateStaff,
  onRemoveStaff
}: AvailableStaffPanelProps) {
  // Filtering logic
  const filteredAvailableStaff = availableStaff.filter(staff => {
    if (staffFilter === 'ALL') return true;
    if (staffFilter === 'ANE') return staff.comments?.includes('[ANE]');
    if (staffFilter === 'OP') return staff.comments?.includes('[OP]');
    if (staffFilter === 'SSK') return staff.comments?.includes('SSK');
    if (staffFilter === 'USK') return staff.comments?.includes('USK');
    return true;
  }).filter(staff => {
    if (!workHoursFilter) return true;
    return staff.workHours?.toLowerCase().includes(workHoursFilter.toLowerCase());
  });

  return (
    <div className="lg:col-span-1">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold">{sv.staff.available}</h2>          {/* Import/Add Controls */}
          <div className="space-y-2 mb-4">
            {/* Combined Import Button */}
            {onImportExcel && (
              <button 
                className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 font-medium"
                onClick={onImportExcel}
                title="Importera Excel-schema (hanterar automatiskt OP/ANE och flera veckor)"
              >
                📄 Importera Schema
              </button>
            )}
            
            {/* Manual Add */}
            <button 
              className="w-full px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              onClick={onAddCustomStaff}
              title="Lägg till tillfällig personal manuellt"
            >
              {sv.actions.add}
            </button>
            
            {/* Clear available staff button */}
            <button
              className="w-full px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 font-medium border border-red-300"
              onClick={onClearAvailableStaff}
              title="Rensa tillgänglig personal för dagen"
            >
              Rensa lista
            </button>
            
            {/* Filter controls */}
            <div className="flex gap-2 mt-2">
              <select
                className="text-xs border rounded px-2 py-1 flex-1"
                value={staffFilter}
                onChange={e => onStaffFilterChange(e.target.value)}
              >
                <option value="ALL">Alla</option>
                <option value="OP">OP</option>
                <option value="ANE">ANE</option>
                <option value="SSK">SSK</option>
                <option value="USK">USK</option>
              </select>
              <input
                className="text-xs border rounded px-2 py-1 flex-1"
                placeholder="Filtrera arbetstid"
                value={workHoursFilter}
                onChange={e => onWorkHoursFilterChange(e.target.value)}
              />
            </div>
          </div>
          
          {/* Staff List */}
          <SortableContext 
            items={filteredAvailableStaff ? filteredAvailableStaff.map(s => s.id) : []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(!filteredAvailableStaff || filteredAvailableStaff.length === 0) ? (
                <div className="text-center text-gray-500 py-8">
                  {sv.messages.noStaffAvailable}
                </div>
              ) : (
                filteredAvailableStaff.map((staff) => (
                  <SortableStaffItem
                    key={staff.id}
                    staff={staff}
                    onEdit={(updated) => onUpdateStaff(staff.id, updated)}
                    onRemove={onRemoveStaff}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
