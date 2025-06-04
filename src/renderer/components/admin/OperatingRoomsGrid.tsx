import { DroppableZone } from '../shared';
import { sv } from '../../i18n/sv';
import type { OperatingRoom } from '../../types';

interface OperatingRoomsGridProps {
  rooms: OperatingRoom[];
  onUnassignStaff: (staffId: string) => void;
}

/**
 * Grid component for displaying and managing operating room staff assignments.
 * Features drag-and-drop zones for each staff role with unassignment functionality.
 */
export default function OperatingRoomsGrid({
  rooms,
  onUnassignStaff
}: OperatingRoomsGridProps) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold">{sv.rooms.operatingRoom}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="p-3">
                  <h3 className="text-base font-semibold">{room.name}</h3>
                  
                  {/* Role Slots */}
                  <div className="space-y-2">
                    {/* Pass */}
                    <DroppableZone id={`room-${room.id.split('-')[1]}-pass`} minHeight="min-h-[60px]">
                      <div className="text-xs font-semibold text-gray-600 mb-1 p-2">
                        {sv.staff.pass}
                      </div>
                      {room.staff.pass && room.staff.pass.length > 0 ? (
                        room.staff.pass.map((staffMember) => (
                          <div key={staffMember.id} className="bg-info text-info-content p-2 rounded text-xs m-2">
                            <div className="font-semibold">{staffMember.name}</div>
                            <div className="text-xs opacity-80">{staffMember.workHours}</div>
                            <button 
                              onClick={() => onUnassignStaff(staffMember.id)}
                              className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 float-right mt-1"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 text-xs py-2">
                          Dra personal hit
                        </div>
                      )}
                    </DroppableZone>

                    {/* Op SSK */}
                    <DroppableZone id={`room-${room.id.split('-')[1]}-opSSK`} minHeight="min-h-[60px]">
                      <div className="text-xs font-semibold text-gray-600 mb-1 p-2">
                        {sv.staff.opSSK}
                      </div>
                      {room.staff.opSSK && room.staff.opSSK.length > 0 ? (
                        room.staff.opSSK.map((staffMember) => (
                          <div key={staffMember.id} className="bg-success text-success-content p-2 rounded text-xs m-2">
                            <div className="font-semibold">{staffMember.name}</div>
                            <div className="text-xs opacity-80">{staffMember.workHours}</div>
                            <button 
                              onClick={() => onUnassignStaff(staffMember.id)}
                              className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 float-right mt-1"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 text-xs py-2">
                          Dra personal hit
                        </div>
                      )}
                    </DroppableZone>

                    {/* Ane SSK */}
                    <DroppableZone id={`room-${room.id.split('-')[1]}-aneSSK`} minHeight="min-h-[60px]">
                      <div className="text-xs font-semibold text-gray-600 mb-1 p-2">
                        {sv.staff.aneSSK}
                      </div>
                      {room.staff.aneSSK && room.staff.aneSSK.length > 0 ? (
                        room.staff.aneSSK.map((staffMember) => (
                          <div key={staffMember.id} className="bg-warning text-warning-content p-2 rounded text-xs m-2">
                            <div className="font-semibold">{staffMember.name}</div>
                            <div className="text-xs opacity-80">{staffMember.workHours}</div>
                            <button 
                              onClick={() => onUnassignStaff(staffMember.id)}
                              className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 float-right mt-1"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 text-xs py-2">
                          Dra personal hit
                        </div>
                      )}
                    </DroppableZone>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
