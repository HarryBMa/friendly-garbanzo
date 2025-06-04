import type { CorridorRole, CorridorFunction } from '../types';

/**
 * Creates a new corridor function with default values
 */
export function createCorridorFunction(
  label: string,
  id?: string
): CorridorFunction {
  return {
    id: id || `function-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label,
    staff: undefined
  };
}

/**
 * Creates a new corridor role with empty functions array
 */
export function createCorridorRole(
  name: 'Op SSK' | 'Ane SSK' | 'Pass',
  id?: string
): CorridorRole {
  return {
    id: id || `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    functions: []
  };
}

/**
 * Validates corridor function data
 */
export function validateCorridorFunction(func: CorridorFunction): string[] {
  const errors: string[] = [];

  if (!func.label || func.label.trim().length === 0) {
    errors.push('Funktionsetikett krävs');
  }

  if (func.label && func.label.length > 50) {
    errors.push('Funktionsetikett får inte vara längre än 50 tecken');
  }

  if (func.staff) {
    if (!func.staff.name || func.staff.name.trim().length === 0) {
      errors.push('Personalnamn krävs om personal är tilldelad');
    }

    if (func.staff.name && func.staff.name.length > 100) {
      errors.push('Personalnamn får inte vara längre än 100 tecken');
    }

    if (!func.staff.workHours || func.staff.workHours.trim().length === 0) {
      errors.push('Arbetstider krävs om personal är tilldelad');
    }

    if (func.staff.workHours && func.staff.workHours.length > 50) {
      errors.push('Arbetstider får inte vara längre än 50 tecken');
    }    if (func.staff.comments && func.staff.comments.length > 500) {
      errors.push('Kommentarer får inte vara längre än 500 tecken');
    }

    if (func.pager && func.pager.length > 20) {
      errors.push('Sökarnummer får inte vara längre än 20 tecken');
    }

    if (func.lunchRooms) {
      func.lunchRooms.forEach((room, index) => {
        if (!room || room.trim().length === 0) {
          errors.push(`Lunch rum ${index + 1} får inte vara tomt`);
        }
        if (room && room.length > 10) {
          errors.push(`Lunch rum ${index + 1} får inte vara längre än 10 tecken`);
        }
      });
    }
  }

  return errors;
}

/**
 * Validates corridor role data
 */
export function validateCorridorRole(role: CorridorRole): string[] {
  const errors: string[] = [];

  if (!role.name || role.name.trim().length === 0) {
    errors.push('Rollnamn krävs');
  }

  if (role.name && role.name.length > 100) {
    errors.push('Rollnamn får inte vara längre än 100 tecken');
  }

  if (!role.functions || !Array.isArray(role.functions)) {
    errors.push('Funktioner måste vara en array');
  } else {
    role.functions.forEach((func, index) => {
      const funcErrors = validateCorridorFunction(func);
      funcErrors.forEach(error => {
        errors.push(`Funktion ${index + 1}: ${error}`);
      });
    });
  }

  return errors;
}

/**
 * Counts total assigned staff in a corridor role
 */
export function countAssignedStaff(role: CorridorRole): number {
  return role.functions.filter(func => func.staff !== undefined).length;
}

/**
 * Gets all lunch rooms covered by a corridor role
 */
export function getLunchRoomsCovered(role: CorridorRole): string[] {
  const rooms: string[] = [];
    role.functions.forEach(func => {
    if (func.lunchRooms) {
      rooms.push(...func.lunchRooms);
    }
  });

  // Remove duplicates and sort
  return [...new Set(rooms)].sort();
}

/**
 * Finds a function by its label within a corridor role
 */
export function findFunctionByLabel(role: CorridorRole, label: string): CorridorFunction | undefined {
  return role.functions.find(func => func.label === label);
}
