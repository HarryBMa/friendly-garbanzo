import { useState, useRef, useEffect } from 'react';
import type { StaffMember } from '../types';

type CompactLevel = 'full' | 'compact' | 'minimal' | 'tiny';

interface StaffCardProps {
  staff: StaffMember;
  isDragging?: boolean;
  isCompact?: boolean;
  showActions?: boolean;
  onEdit?: (staff: StaffMember) => void;
  onRemove?: (staffId: string) => void;
  maxWidth?: number; // Allows parent to specify available space
}

export default function StaffCard({ 
  staff, 
  isDragging = false, 
  isCompact = false,
  showActions = false,
  onEdit,
  onRemove,
  maxWidth
}: StaffCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({
    name: staff.name,
    workHours: staff.workHours,
    comments: staff.comments
  });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState<number>(0);
  
  // Observe card width for responsive design
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setCardWidth(entry.contentRect.width);
      }
    });
    
    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);
  
  // Determine compact level based on available space
  const getCompactLevel = (): CompactLevel => {
    const width = maxWidth || cardWidth;
    if (width < 80) return 'tiny';
    if (width < 120) return 'minimal'; 
    if (width < 180 || isCompact) return 'compact';
    return 'full';
  };
  
  const compactLevel = getCompactLevel();
  
  // Dynamic styling based on compact level
  const getStyles = () => {
    switch (compactLevel) {
      case 'tiny':
        return {
          padding: 'p-1',
          textSize: 'text-[10px]',
          nameSize: 'text-[11px]',
          showComments: false,
          showWorkHours: false,
          showCustomIndicator: false
        };
      case 'minimal':
        return {
          padding: 'p-1.5',
          textSize: 'text-xs',
          nameSize: 'text-xs',
          showComments: false,
          showWorkHours: true,
          showCustomIndicator: false
        };
      case 'compact':
        return {
          padding: 'p-2',
          textSize: 'text-xs',
          nameSize: 'text-sm',
          showComments: true,
          showWorkHours: true,
          showCustomIndicator: false
        };
      default: // full
        return {
          padding: 'p-3',
          textSize: 'text-sm',
          nameSize: 'text-base',
          showComments: true,
          showWorkHours: true,
          showCustomIndicator: true
        };
    }
  };
    const styles = getStyles();
  
  const cardClass = `
    bg-white shadow-sm rounded cursor-move transition-all border border-gray-200
    ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
    ${styles.padding}
  `;

  const handleEditClick = () => setEditMode(true);
  const handleCancel = () => {
    setEditValues({ name: staff.name, workHours: staff.workHours, comments: staff.comments });
    setEditMode(false);
  };
  const handleSave = () => {
    if (onEdit) onEdit({ ...staff, ...editValues });
    setEditMode(false);
  };

  return (
    <div ref={cardRef} className={cardClass} draggable>
      {/* Staff Name */}
      <div className="flex items-start justify-between">
        {editMode ? (
          <input
            className={`font-semibold text-gray-900 ${styles.nameSize} leading-tight truncate border-b border-gray-300 bg-white focus:outline-none w-32`}
            value={editValues.name}
            onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
          />
        ) : (
          <h3 className={`font-semibold text-gray-900 ${styles.nameSize} leading-tight truncate`}>
            {staff.name}
          </h3>
        )}
        {showActions && !editMode && compactLevel !== 'tiny' && (
          <div className="relative">
            <div tabIndex={0} role="button" className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
              ⋮
            </div>
            <ul tabIndex={0} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-32 p-2 hidden focus-within:block hover:block">
              {onEdit && (
                <li>
                  <button 
                    className="text-xs w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                    onClick={handleEditClick}
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
      {styles.showWorkHours && (
        editMode ? (
          <input
            className={`text-gray-600 ${styles.textSize} ${compactLevel === 'compact' ? 'mt-0.5' : 'mt-1'} border-b border-gray-300 bg-white focus:outline-none w-24`}
            value={editValues.workHours}
            onChange={e => setEditValues(v => ({ ...v, workHours: e.target.value }))}
          />
        ) : (
          staff.workHours && (
            <div className={`text-gray-600 ${styles.textSize} ${compactLevel === 'compact' ? 'mt-0.5' : 'mt-1'}`}>
              {staff.workHours}
            </div>
          )
        )
      )}
      {/* Comments */}
      {styles.showComments && (
        editMode ? (
          <textarea
            className={`text-gray-500 italic ${compactLevel === 'compact' ? 'text-[10px] mt-0.5' : 'text-xs mt-1'} border border-gray-300 rounded w-full bg-white focus:outline-none`}
            rows={2}
            value={editValues.comments}
            onChange={e => setEditValues(v => ({ ...v, comments: e.target.value }))}
          />
        ) : (
          staff.comments && (
            <div className={`text-gray-500 italic ${compactLevel === 'compact' ? 'text-[10px] mt-0.5' : 'text-xs mt-1'} line-clamp-2`}>
              {staff.comments}
            </div>
          )
        )
      )}      {/* Edit Mode Actions */}
      {editMode && (
        <div className="flex gap-2 mt-2">
          <button className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleSave}>Spara</button>
          <button className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={handleCancel}>Avbryt</button>
        </div>
      )}
      {/* Custom staff indicator */}
      {styles.showCustomIndicator && staff.isCustom && !editMode && (
        <div className={compactLevel === 'compact' ? 'mt-1' : 'mt-2'}>
          <span className={`inline-block px-2 py-1 text-xs border border-gray-300 rounded-full ${compactLevel === 'compact' ? 'text-[10px] px-1' : ''}`}>
            Manuell
          </span>
        </div>
      )}
    </div>
  );
}
