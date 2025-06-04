import StaffGrid from './StaffGrid';
import useCorridorStore from '../stores/corridorStore';

// Staff configurations
const OP_STAFF_COLUMNS = [
  { id: 'op-76821', pager: '76821', function: 'OP-SSK' },
  { id: 'op-76822', pager: '76822', function: 'USK' },
  { id: 'op-76823', pager: '76823', function: 'OP-SSK' },
  { id: 'op-78825', pager: '78825', function: 'USK' },
  { id: 'op-76824', pager: '76824', function: 'MT' },
  { id: 'op-74242', pager: '74242', function: '' },
  { id: 'op-72618', pager: '72618', function: 'sterilen' }
];

const ANE_STAFF_COLUMNS = [
  { id: 'ane-73313', pager: '73313', function: '' },
  { id: 'ane-78857', pager: '78857', function: '' },
  { id: 'ane-73324', pager: '73324', function: '' },
  { id: 'ane-70173', pager: '70173', function: '' },
  { id: 'ane-70179', pager: '70179', function: 'Ane usk' },
  { id: 'ane-73740', pager: '73740', function: 'Ane usk' }
];

interface CorridorGridProps {
  className?: string;
}

export default function CorridorGrid({ className = '' }: CorridorGridProps) {
  const {
    assignments,
    opExtraStaffCount,
    aneExtraStaffCount,
    addOpExtraStaff,
    addAneExtraStaff,
    removeOpExtraStaff,
    removeAneExtraStaff,
  } = useCorridorStore();

  return (
    <div className={`p-4 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Korridor Personal</h2>
      
      <StaffGrid
        title="OP Personal"
        columns={OP_STAFF_COLUMNS}
        assignments={assignments}
        extraStaffCount={opExtraStaffCount}
        onAddExtraStaff={addOpExtraStaff}
        onRemoveExtraStaff={removeOpExtraStaff}
      />
      
      <StaffGrid
        title="Anestesi Personal"
        columns={ANE_STAFF_COLUMNS}
        assignments={assignments}
        extraStaffCount={aneExtraStaffCount}
        onAddExtraStaff={addAneExtraStaff}
        onRemoveExtraStaff={removeAneExtraStaff}
      />
    </div>
  );
}
