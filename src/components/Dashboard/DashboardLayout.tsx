// src/components/Dashboard/DashboardLayout.tsx
import React from 'react';

export default function DashboardLayout() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Header */}
      <header className="bg-indigo-700 text-white text-center py-4 text-xl font-bold shadow-md">
        Operationsschema – Idag
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main + Secondary (Left side) */}
        <div className="flex flex-col flex-[4] overflow-hidden">
          {/* Main Content (Rooms) */}
          <div className="flex-[0_0_65%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 overflow-hidden">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-md shadow p-4 flex flex-col flex-shrink min-w-0"
              >
                <h3 className="font-semibold text-gray-800 mb-2">Sal 370{idx + 1}</h3>
                <p className="text-sm text-gray-500">RoomCard placeholder</p>
              </div>
            ))}
          </div>

          {/* Corridor Staff Section */}
          <div className="flex-[0_0_35%] bg-gray-100 p-4 overflow-hidden">
            <h2 className="text-md font-semibold text-gray-700 mb-2">
              Korridorpersonal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border rounded p-2 text-sm flex flex-col"
                >
                  <span className="font-medium">Namn: Personal {i + 1}</span>
                  <span>Personsökare: 123{i}</span>
                  <span>Lunchavlösning: Sal 370{(i % 4) + 1}</span>
                  <span>Arbetstid: 7–16</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tertiary Panel */}
        <aside className="flex-[1] border-l bg-white p-4 overflow-hidden">
          <h2 className="text-md font-semibold text-gray-800 mb-2">Info-panel</h2>
          <p className="text-sm text-gray-600">Detaljerad information visas här.</p>
        </aside>
      </div>
    </div>
  );
}
