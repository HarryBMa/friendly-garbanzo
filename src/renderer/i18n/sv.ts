export const sv = {
  // Application
  appTitle: 'Operationssals Personalschema',
    // Navigation
  planning: 'Planering',
  dashboardView: 'Översikt',
  
  // Days of the week
  days: {
    monday: 'Måndag',
    tuesday: 'Tisdag', 
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lördag',
    sunday: 'Söndag'
  },
  
  // Staff and roles
  staff: {
    name: 'Namn',
    workHours: 'Arbetstid',
    comments: 'Kommentarer',
    available: 'Tillgänglig personal',
    pass: 'Pass',
    opSSK: 'Op SSK',
    aneSSK: 'Ane SSK',
    student: 'Student',
    corridor: 'Korridor'
  },
  
  // Operating rooms
  rooms: {
    operatingRoom: 'Operationssal',
    room: 'Sal',
    roomShort: 'Sal'
  },
  
  // Corridor roles
  corridor: {
    search: 'Sök/Mottagning',
    responsibility: 'Korridorsansvar', 
    standby: 'Beredskap',
    pager: 'Telefon',
    function: 'Funktion'
  },
    // Actions
  actions: {
    import: 'Importera',
    importDual: 'Importera OP + ANE',
    importSingle: 'Importera enskild fil',
    export: 'Exportera',
    save: 'Spara',
    cancel: 'Avbryt',
    add: 'Lägg till',
    remove: 'Ta bort',
    edit: 'Redigera',
    copy: 'Kopiera',
    paste: 'Klistra in',
    clear: 'Rensa',
    refresh: 'Uppdatera'
  },
    // File operations
  files: {
    importExcel: 'Importera från Excel',
    importDualExcel: 'Importera OP- och ANE-filer',
    exportExcel: 'Exportera till Excel',
    selectFiles: 'Välj OP- och ANE-filer',
    selectFile: 'Välj fil',
    fileImported: 'Fil importerad',
    filesImported: 'Filer importerade',
    fileExported: 'Fil exporterad',
    importError: 'Import misslyckades',
    exportError: 'Export misslyckades',
    dualImportSuccess: 'OP- och ANE-filer importerade',
    weekInfo: 'Vecka {week}: {opFile} + {aneFile}'
  },
  
  // Messages
  messages: {
    dragToAssign: 'Dra personal till sal eller korridor',
    noStaffAvailable: 'Ingen personal tillgänglig',
    scheduleEmpty: 'Schema tomt',
    unsavedChanges: 'Osparade ändringar',
    confirmDelete: 'Bekräfta borttagning',
    dataValidation: 'Datavalidering',
    success: 'Lyckades',
    error: 'Fel',
    warning: 'Varning',
    info: 'Information'
  },
  
  // Dashboard
  dashboard: {
    title: 'Översikt - Dagens schema',
    currentDay: 'Aktuell dag',
    autoRefresh: 'Automatisk uppdatering',
    fullscreen: 'Helskärm',
    lastUpdated: 'Senast uppdaterad',
    noSchedule: 'Inget schema för denna dag'
  },
  
  // Time formats
  time: {
    format: 'HH:mm',
    dateFormat: 'YYYY-MM-DD',
    dateTimeFormat: 'YYYY-MM-DD HH:mm'
  },
  
  // Validation messages
  validation: {
    nameRequired: 'Namn krävs',
    workHoursRequired: 'Arbetstid krävs',
    invalidTimeFormat: 'Ogiltigt tidsformat',
    staffAlreadyAssigned: 'Personal redan tilldelad',
    conflictingHours: 'Konflikterande arbetstider',
    exceedsCapacity: 'Överskrider kapacitet'
  }
} as const;

export type TranslationKey = keyof typeof sv;
export default sv;
