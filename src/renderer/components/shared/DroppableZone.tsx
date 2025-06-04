import { useDroppable } from '@dnd-kit/core';

interface DroppableZoneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string; // Allow customization of min-height
}

/**
 * Shared DroppableZone component for drag-and-drop functionality.
 * Used across Admin planning interface and corridor grids.
 * 
 * Features:
 * - Visual feedback on drag over (blue border/background)
 * - Customizable styling and minimum height
 * - Consistent drop zone behavior across the app
 */
export default function DroppableZone({ 
  id, 
  children, 
  className = '',
  minHeight = 'min-h-[60px]' // Default from Admin.tsx
}: DroppableZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  
  const baseClasses = `
    ${className} 
    ${isOver ? 'bg-blue-50 border-blue-400 border-2' : 'border-2 border-dashed border-gray-300'} 
    transition-colors rounded ${minHeight}
  `.trim();
  
  return (
    <div 
      ref={setNodeRef}
      className={baseClasses}
    >
      {children}
    </div>
  );
}
