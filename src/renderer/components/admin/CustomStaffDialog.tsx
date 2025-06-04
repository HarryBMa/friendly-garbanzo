import React from 'react';

interface CustomStaffForm {
  name: string;
  workHours: string;
  comments: string;
}

interface CustomStaffDialogProps {
  isOpen: boolean;
  form: CustomStaffForm;
  onFormChange: (form: CustomStaffForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Modal dialog for manually adding temporary staff members.
 * Allows input of name (required), work hours, and comments.
 */
export default function CustomStaffDialog({
  isOpen,
  form,
  onFormChange,
  onSubmit,
  onCancel
}: CustomStaffDialogProps) {
  if (!isOpen) return null;

  const handleInputChange = (field: keyof CustomStaffForm, value: string) => {
    onFormChange({
      ...form,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Lägg till tillfällig personal</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Namn *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ange namn på personal"
              autoFocus
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arbetstid (valfritt)
            </label>
            <input
              type="text"
              value={form.workHours}
              onChange={(e) => handleInputChange('workHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="t.ex. 07:00-15:30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kommentarer (valfritt)
            </label>
            <input
              type="text"
              value={form.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Eventuella kommentarer"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Lägg till
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { CustomStaffForm };
