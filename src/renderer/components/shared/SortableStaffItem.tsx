import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StaffCard from '../StaffCard';
import type { StaffMember } from '../../types';

interface SortableStaffItemProps {
  staff: StaffMember;
  onEdit: (updated: Partial<StaffMember>) => void;
  onRemove: (staffId: string) => void;
}

/**
 * Sortable wrapper component for StaffCard with drag-and-drop functionality.
 * Handles drag state and styling while delegating staff display to StaffCard.
 */
export default function SortableStaffItem({ 
  staff,
  onEdit,
  onRemove
}: SortableStaffItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: staff.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <StaffCard
        staff={staff}
        isDragging={isDragging}
        showActions={true}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    </div>
  );
}
