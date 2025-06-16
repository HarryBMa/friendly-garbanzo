import type { SyncConflict } from '../../types';

interface ConflictResolutionDialogProps {
  conflict: SyncConflict;
  onResolve: (useLocal: boolean) => void;
  onCancel: () => void;
}

export function ConflictResolutionDialog({ 
  conflict, 
  onResolve, 
  onCancel 
}: ConflictResolutionDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE');
  };

  const getWeekNames = (weeks: any[]) => {
    return weeks.map(w => w.name).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-600 text-lg">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Schemakonflikt upptäckt
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Schemat har ändrats av en annan användare medan du arbetade. 
            Välj vilken version du vill behålla:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local version */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-2">
                🖥️ Din lokala version
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Veckor:</strong> {getWeekNames(conflict.local)}</p>
                <p><strong>Antal veckor:</strong> {conflict.local.length}</p>
                <p><strong>Senast ändrad:</strong> Nu (dina ändringar)</p>
              </div>
            </div>

            {/* Remote version */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-green-900 mb-2">
                🌐 Nätverksversion
              </h3>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Veckor:</strong> {getWeekNames(conflict.remote)}</p>
                <p><strong>Antal veckor:</strong> {conflict.remote.length}</p>
                <p><strong>Senast ändrad:</strong> {formatDate(conflict.lastModified)}</p>
                <p><strong>Ändrad av:</strong> {conflict.modifiedBy}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={() => onResolve(false)}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Använd nätverksversion
          </button>
          <button
            onClick={() => onResolve(true)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Behåll mina ändringar
          </button>
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            💡 <strong>Tips:</strong> För att undvika konflikter i framtiden, kommunicera med dina kollegor 
            om vem som arbetar med schemat när.
          </p>
        </div>
      </div>
    </div>
  );
}
