import { Language } from '../types/gantt';

export interface Translations {
  appName: string;
  appTagline: string;
  aiDisclaimer: string;
  downloadWindows: string;
  downloadWindowsSubtitle: string;
  windowsApp: string;
  
  // Home
  createProject: string;
  createProjectDesc: string;
  enterProjectCode: string;
  enterProjectCodeDesc: string;
  projectCodePlaceholder: string;
  openProject: string;
  newProjectTitle: string;
  projectTitlePlaceholder: string;
  projectCodeCustomPlaceholder: string;
  createButton: string;
  recentProjects: string;
  noRecentProjects: string;
  exploreDemo: string;
  codeHelp: string;
  invalidCode: string;
  projectNotFound: string;
  copyCode: string;
  codeCopied: string;
  shareUrl: string;
  urlCopied: string;

  homeAccessOrCreateTitle: string;
  homeProjectCodeLabel: string;
  homeProjectCodePlaceholder: string;
  homeCodeHint: string;
  homeAccessButton: string;
  homeRandomCodeButton: string;
  homeRandomCodeTooltip: string;
  homeNeedExample: string;
  homeNewProjectDetected: string;
  homeNewProjectCodeNotice: string;
  homeProjectNameLabel: string;
  homeProjectNamePlaceholder: string;
  homeBackButton: string;
  homeCreateAndOpenButton: string;
  homeItemsCount: string;
  homeRemoveFromHistoryTooltip: string;
  homeFooterText: string;
  
  // Header & Controls
  backToHome: string;
  today: string;
  zoom: string;
  zoomDays: string;
  zoomWeeks: string;
  zoomMonths: string;
  zoomYears: string;
  exportPresentation: string;
  presentationMode: string;
  exitPresentation: string;
  addTask: string;
  addGroup: string;
  addMilestone: string;
  sidebarToggle: string;
  saveStatus: string;

  // Task list & Table
  itemName: string;
  itemType: string;
  itemDates: string;
  itemDuration: string;
  itemProgress: string;
  itemMode: string;
  itemPredecessor: string;
  actions: string;
  noItemsYet: string;
  noItemsDesc: string;
  
  // Types & Modes
  task: string;
  group: string;
  milestone: string;
  manual: string;
  manualDesc: string;
  auto: string;
  autoDesc: string;
  
  // Modal editor
  editItem: string;
  newItem: string;
  titleLabel: string;
  typeLabel: string;
  schedulingLabel: string;
  predecessorLabel: string;
  noPredecessor: string;
  lagLabel: string;
  lagDays: string;
  predecessorManualDesc: string;
  predecessorGroupDesc: string;
  startDateLabel: string;
  endDateLabel: string;
  durationLabel: string;
  days: string;
  dayShort: string;
  progressLabel: string;
  colorLabel: string;
  groupParentLabel: string;
  noParentGroup: string;
  assigneeLabel: string;
  selectAssigneePlaceholder: string;
  newAssigneePrompt: string;
  unassigned: string;
  quickTeamMembers: string;
  teamMembersTitle: string;
  teamMembersDesc: string;
  manageTeamButton: string;
  notesLabel: string;
  saveItem: string;
  cancel: string;
  deleteItem: string;
  confirmDelete: string;

  // Export Modal
  exportModalTitle: string;
  exportModalDesc: string;
  exportPngTitle: string;
  exportPngDesc: string;
  downloadPngButton: string;
  exportPdfTitle: string;
  exportPdfDesc: string;
  printPdfButton: string;
  exportJsonTitle: string;
  exportJsonDesc: string;
  downloadJsonButton: string;
  importJsonTitle: string;
  importJsonDesc: string;
  uploadJsonButton: string;
  presentationSlideTip: string;
  exporting: string;

  // Stats / Presentation
  statsTasks: string;
  statsGroups: string;
  statsMilestones: string;
  statsCompletion: string;
  timeframe: string;
  weekend: string;

  // Collaboration / Realtime
  collabBadge: string;
  collabModalTitle: string;
  collabModalSubtitle: string;
  collabStatusConnected: string;
  collabStatusConnecting: string;
  collabStatusOffline: string;
  collabPrivateBadge: string;
  collabShareSectionTitle: string;
  collabShareSectionDesc: string;
  collabCodeLabel: string;
  collabCopyCode: string;
  collabCopyLink: string;
  collabCopied: string;
  collabProfileTitle: string;
  collabProfileSaved: string;
  collabNamePlaceholder: string;
  collabValidate: string;
  collabAvatarColor: string;
  collabActiveUsersTitle: string;
  collabLive: string;
  collabOnline: string;
  collabYouBadge: string;
  collabFirstUser: string;
  collabRecentSync: string;
  collabFooterTip: string;
  collabHeaderButton: string;
  collabHeaderLive: string;
  collabHeaderTooltip: string;
  collabUserJoined: string;
  collabUserLeft: string;
  collabUpdatedGantt: string;
  close: string;

  // Filters
  filterLabel: string;
  searchTasksPlaceholder: string;
  allMembers: string;
  unassigned: string;
  lateFilter: string;
  lateFilterTooltip: string;
  milestonesFilter: string;
  milestonesFilterTooltip: string;
  filterAll: string;
  filterTodo: string;
  filterInProgress: string;
  filterDone: string;
  filterTodoTooltip: string;
  filterInProgressTooltip: string;
  filterDoneTooltip: string;
  resetFilters: string;
  resetFiltersTooltip: string;
  filterToggleShow: string;
  filterToggleHide: string;

  // Drag to link & chart interactions
  dragToLinkDotTooltip: string;
  dragToLinkReleaseTarget: string;
  dragToLinkConnecting: string;
  dragToLinkConnectTo: string;
  dragResizeDurationTooltip: string;
  dragResizeStartTooltip: string;
  dragMoveUp: string;
  dragMoveDown: string;

  // Header & Controls Extras
  workloadButton: string;
  workloadTooltip: string;
  presentationButtonTooltip: string;
  exportButtonTooltip: string;
  shortcutsTooltip: string;
  notificationsTooltip: string;
  readOnlyBadge: string;
  readOnlyTooltip: string;
  centerTodayTooltip: string;
  undoTooltip: string;
  redoTooltip: string;
  themeLight: string;
  themeDark: string;
  toggleThemeTooltip: string;

  // Export Modal Extras (One-Pager, ICS, PDF Landscape, etc.)
  exportOnePagerTitle: string;
  exportOnePagerDesc: string;
  exportOnePagerBadge: string;
  exportOnePagerButton: string;
  exportOnePagerSuccess: string;
  exportIcsTitle: string;
  exportIcsDesc: string;
  exportIcsButton: string;
  exportIcsSuccess: string;
  exportPdfLandscapeTitle: string;
  exportPdfLandscapeDesc: string;
  exportPdfLandscapeA4: string;
  exportPdfLandscapeA3: string;
  exportPdfA4Success: string;
  exportPdfA3Success: string;
  exportPdfA4Tooltip: string;
  exportPdfA3Tooltip: string;
  exportScaleLabel: string;
  launchPresentationMode: string;
  presentationModeCardDesc: string;

  // Multi-views
  viewGantt: string;
  viewKanban: string;
  viewList: string;
  viewCalendar: string;
  viewSwitcherTooltip: string;
  
  // Kanban
  kanbanTodo: string;
  kanbanInProgress: string;
  kanbanReview: string;
  kanbanDone: string;
  kanbanAddTask: string;
  kanbanNoTasks: string;
  kanbanDropHere: string;

  // List View
  listColName: string;
  listColType: string;
  listColDates: string;
  listColDuration: string;
  listColProgress: string;
  listColAssignee: string;
  listColMode: string;
  listColStatus: string;
  listColActions: string;
  listQuickAdd: string;
  listTotalTasks: string;

  // Calendar View
  calendarToday: string;
  calendarMonth: string;
  calendarPrevMonth: string;
  calendarNextMonth: string;
  calendarAddTaskAtDate: string;
  calendarNoTasksThisDay: string;

  // Comments Notification
  commentsModalTitle: string;
  commentsModalSubtitle: string;
  commentsCount: string;
  commentsEmpty: string;
  commentsEmptyDesc: string;
  commentsOpenTask: string;
  commentsSearchPlaceholder: string;
}

export const WINDOWS_DOWNLOAD_URL = 'https://github.com/polux549/GanttForStudent/releases';

export const translations: Record<Language, Translations> = {
  fr: {
    appName: 'Gantt For Student',
    appTagline: 'Planification simple et moderne',
    aiDisclaimer: "Créé avec l'IA, à vos risques et périls.",
    downloadWindows: 'Télécharger pour Windows',
    downloadWindowsSubtitle: 'Application de bureau disponible pour PC Windows',
    windowsApp: 'App Windows',
    
    createProject: 'Créer un nouveau projet',
    createProjectDesc: 'Générez un code unique et commencez immédiatement votre diagramme.',
    enterProjectCode: 'Ouvrir avec un code',
    enterProjectCodeDesc: 'Saisissez votre code unique pour retrouver votre projet sur n’importe quel poste.',
    projectCodePlaceholder: 'Ex: PROJ-2026',
    openProject: 'Ouvrir le projet',
    newProjectTitle: 'Titre de votre projet',
    projectTitlePlaceholder: 'Ex: Projet de semestre, Thèse, Exposé...',
    projectCodeCustomPlaceholder: 'Code personnalisé (optionnel, ex: INFO-PROJ)',
    createButton: 'Créer le Gantt',
    recentProjects: 'Vos projets récents',
    noRecentProjects: 'Aucun projet ouvert récemment sur ce navigateur.',
    exploreDemo: 'Explorer un projet exemple',
    codeHelp: 'Retrouvez votre projet partout grâce à son code ou directement via lien URL.',
    invalidCode: 'Veuillez saisir un code de projet valide.',
    projectNotFound: 'Projet introuvable pour ce code.',
    copyCode: 'Copier le code',
    codeCopied: 'Code copié !',
    shareUrl: 'Partager le lien',
    urlCopied: 'Lien copié dans le presse-papier !',

    homeAccessOrCreateTitle: 'Accéder ou créer avec un code unique',
    homeProjectCodeLabel: 'Code du projet',
    homeProjectCodePlaceholder: 'Ex: PROJET-INFO, MEMOIRE-2026...',
    homeCodeHint: '💡 Si le code existe déjà, vous accédez directement à votre Gantt. Sinon, vous pourrez le créer immédiatement ! (Ne pas débuter un code par $)',
    homeAccessButton: 'Accéder au Gantt',
    homeRandomCodeButton: 'Code aléatoire',
    homeRandomCodeTooltip: 'Générer un code aléatoire automatiquement',
    homeNeedExample: "Besoin d'un exemple ?",
    homeNewProjectDetected: 'Nouveau projet détecté',
    homeNewProjectCodeNotice: "n'existe pas encore. Nommez votre projet pour le créer :",
    homeProjectNameLabel: 'Nom du projet *',
    homeProjectNamePlaceholder: 'Ex: Projet Semestre 2 - Groupe A',
    homeBackButton: 'Retour',
    homeCreateAndOpenButton: 'Créer et ouvrir le Gantt',
    homeItemsCount: 'éléments',
    homeRemoveFromHistoryTooltip: "Retirer de l'historique",
    homeFooterText: 'Gantt For Student · Conçu pour les projets solo et en groupe',

    backToHome: 'Tous les projets',
    today: "Aujourd'hui",
    zoom: 'Échelle',
    zoomDays: 'Jours',
    zoomWeeks: 'Semaines',
    zoomMonths: 'Mois',
    zoomYears: 'Années',
    exportPresentation: 'Exporter',
    presentationMode: 'Mode Présentation',
    exitPresentation: 'Quitter la présentation',
    addTask: 'Ajouter une tâche',
    addGroup: 'Créer un groupe',
    addMilestone: 'Poser un jalon',
    sidebarToggle: 'Masquer la liste',
    saveStatus: 'Enregistré localement',

    itemName: 'Nom',
    itemType: 'Type',
    itemDates: 'Dates',
    itemDuration: 'Durée',
    itemProgress: 'Avancement',
    itemMode: 'Planification',
    itemPredecessor: 'Dépendance',
    actions: 'Actions',
    noItemsYet: 'Aucun élément pour l’instant',
    noItemsDesc: 'Commencez par ajouter une première tâche, un groupe ou un jalon avec les boutons ci-dessus.',

    task: 'Tâche',
    group: 'Groupe',
    milestone: 'Jalon',
    manual: 'Manuel (date fixe)',
    manualDesc: 'Dates de début et de fin définies manuellement.',
    auto: 'Automatique (dépendance)',
    autoDesc: 'Calcule sa date de début juste après la fin d’une tâche précédente.',

    editItem: 'Modifier l’élément',
    newItem: 'Nouvel élément',
    titleLabel: 'Titre',
    typeLabel: 'Type d’élément',
    schedulingLabel: 'Mode de planification',
    predecessorLabel: 'Tâche précédente (prédécesseur)',
    noPredecessor: 'Aucun prédécesseur (indépendant)',
    lagLabel: 'Décalage après la tâche précédente',
    lagDays: 'jour(s)',
    predecessorManualDesc: 'Affiche une flèche de liaison dans le diagramme sans modifier vos dates manuelles.',
    predecessorGroupDesc: 'Affiche une flèche de dépendance vers ce groupe dans le diagramme Gantt.',
    startDateLabel: 'Date de début',
    endDateLabel: 'Date de fin',
    durationLabel: 'Durée',
    days: 'jours',
    dayShort: 'j',
    progressLabel: 'Progression',
    colorLabel: 'Couleur visuelle',
    groupParentLabel: 'Appartient au groupe',
    noParentGroup: 'Aucun groupe (racine)',
    assigneeLabel: 'Responsable / Étudiant',
    selectAssigneePlaceholder: 'Choisir un membre existant...',
    newAssigneePrompt: '+ Nouveau membre',
    unassigned: 'Non assigné',
    quickTeamMembers: 'Membres de l’équipe :',
    teamMembersTitle: 'Équipe & Responsables',
    teamMembersDesc: 'Définissez la liste des membres une seule fois pour les attribuer en 1 clic dans tout le projet.',
    manageTeamButton: 'Équipe',
    notesLabel: 'Notes & livrables',
    saveItem: 'Enregistrer',
    cancel: 'Annuler',
    deleteItem: 'Supprimer',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',

    exportModalTitle: 'Exporter pour une présentation',
    exportModalDesc: 'Plusieurs formats adaptés pour vos soutenances, diaporamas ou rapports de groupe.',
    exportPngTitle: 'Image Haute Définition (PNG)',
    exportPngDesc: 'Génère une image nette prête à insérer dans PowerPoint, Google Slides, Canva ou Word.',
    downloadPngButton: 'Télécharger l’image PNG',
    exportPdfTitle: 'Format Diapositive / Impression (PDF)',
    exportPdfDesc: 'Mise en page optimisée pour la projection plein écran ou l’impression PDF en format paysage.',
    printPdfButton: 'Imprimer / Sauvegarder en PDF',
    exportJsonTitle: 'Sauvegarde du fichier projet (JSON)',
    exportJsonDesc: 'Téléchargez le fichier de données brut pour le conserver ou l’envoyer à un collègue.',
    downloadJsonButton: 'Télécharger le fichier .json',
    importJsonTitle: 'Importer un projet JSON',
    importJsonDesc: 'Chargez un projet exporté depuis ce format pour le modifier.',
    uploadJsonButton: 'Importer un fichier .json',
    presentationSlideTip: 'Astuce : Utilisez aussi le bouton "Mode Présentation" pour projeter en plein écran directement lors de votre oral.',
    exporting: 'Génération en cours...',

    statsTasks: 'Tâches',
    statsGroups: 'Groupes',
    statsMilestones: 'Jalons',
    statsCompletion: 'Avancement global',
    timeframe: 'Période du projet',
    weekend: 'Week-end',

    collabBadge: 'FONCTIONNALITÉ EXPÉRIMENTALE',
    collabModalTitle: 'Collaboration en Direct (P2P)',
    collabModalSubtitle: 'Synchronisation instantanée multi-utilisateurs sur le même Gantt',
    collabStatusConnected: 'Connecté en direct · Canal temps réel actif',
    collabStatusConnecting: 'Connexion au réseau de pairs...',
    collabStatusOffline: 'Hors ligne · Sauvegarde locale conservée',
    collabPrivateBadge: '100% Privé',
    collabShareSectionTitle: 'Partager ce projet avec des collègues',
    collabShareSectionDesc: 'Toute personne ouvrant ce lien ou saisissant ce code rejoindra automatiquement votre session en direct. Vos modifications se répercuteront instantanément !',
    collabCodeLabel: 'Code :',
    collabCopyCode: 'Copier le Code',
    collabCopyLink: 'Copier',
    collabCopied: 'Copié !',
    collabProfileTitle: 'Mon identité de collaborateur',
    collabProfileSaved: 'Enregistré',
    collabNamePlaceholder: 'Votre prénom ou pseudo (ex: Alice)',
    collabValidate: 'Valider',
    collabAvatarColor: "Couleur d'avatar :",
    collabActiveUsersTitle: 'Collaborateurs sur ce projet',
    collabLive: 'En direct',
    collabOnline: 'En ligne',
    collabYouBadge: 'Vous',
    collabFirstUser: 'Vous êtes le premier dans ce projet. Partagez le lien pour inviter des collègues !',
    collabRecentSync: 'Dernières actions synchronisées',
    collabFooterTip: 'Changements diffusés en continu',
    collabHeaderButton: 'Collaborer',
    collabHeaderLive: 'en direct',
    collabHeaderTooltip: 'Collaborer en direct (P2P multi-utilisateurs)',
    collabUserJoined: 'a rejoint la session',
    collabUserLeft: 'a quitté la session',
    collabUpdatedGantt: 'a mis à jour le Gantt',
    close: 'Fermer',

    filterLabel: 'Filtres :',
    searchTasksPlaceholder: 'Rechercher une tâche...',
    allMembers: 'Tous les membres',
    unassigned: 'Non assigné',
    lateFilter: 'En retard',
    lateFilterTooltip: "Afficher uniquement les tâches en retard dont l'échéance est passée",
    milestonesFilter: 'Jalons',
    milestonesFilterTooltip: 'Afficher uniquement les jalons clés',
    filterAll: 'Tous',
    filterTodo: 'À faire',
    filterInProgress: 'En cours',
    filterDone: 'Terminé',
    filterTodoTooltip: 'Tâches à 0%',
    filterInProgressTooltip: 'Tâches entre 1% et 99%',
    filterDoneTooltip: 'Tâches terminées à 100%',
    resetFilters: 'Effacer',
    resetFiltersTooltip: 'Réinitialiser tous les filtres',
    filterToggleShow: 'Afficher la barre de filtres',
    filterToggleHide: 'Masquer la barre de filtres',

    dragToLinkDotTooltip: 'Liaison directe (Drag-to-link) : cliquez et glissez ce point blanc vers une autre tâche pour créer une dépendance',
    dragToLinkReleaseTarget: 'Relâcher pour lier à',
    dragToLinkConnecting: 'Liaison : glissez vers une tâche dépendante...',
    dragToLinkConnectTo: 'Lier à :',
    dragResizeDurationTooltip: 'Glisser pour allonger ou réduire la durée (jours)',
    dragResizeStartTooltip: 'Glisser pour modifier le début',
    dragMoveUp: '↑ Monter',
    dragMoveDown: '↓ Descendre',

    workloadButton: 'Charge',
    workloadTooltip: "Gestion des charges de travail de l'équipe",
    presentationButtonTooltip: 'Mode Présentation plein écran (Touche P)',
    exportButtonTooltip: 'Exporter le projet (PDF, PNG, JSON - Touche E)',
    shortcutsTooltip: 'Raccourcis clavier (Touche ?)',
    notificationsTooltip: "Rappels de jalons & notifications d'échéances",
    readOnlyBadge: 'Lecture seule',
    readOnlyTooltip: 'Mode Consultation (Lecture seule)',
    centerTodayTooltip: "Centrer la vue sur aujourd'hui",
    undoTooltip: 'Annuler (Ctrl+Z)',
    redoTooltip: 'Rétablir (Ctrl+Y)',
    themeLight: 'Thème blanc',
    themeDark: 'Thème sombre',
    toggleThemeTooltip: 'Basculer entre le thème sombre et le thème blanc',

    exportOnePagerTitle: 'Fiche de synthèse pour jury · One-Pager (PDF)',
    exportOnePagerDesc: "Synthèse exécutive au format A4 portrait : métriques clés, tableau des jalons, découpage par phases et répartition de l'équipe. Idéal à joindre au mémoire ou à remettre au jury.",
    exportOnePagerBadge: 'Spécial Soutenance',
    exportOnePagerButton: 'Générer One-Pager',
    exportOnePagerSuccess: 'Téléchargé !',
    exportIcsTitle: 'Export Calendrier (.ics)',
    exportIcsDesc: 'Synchronisez vos tâches et jalons dans Google Calendar, Apple Agenda ou Outlook avec rappels automatiques.',
    exportIcsButton: 'Télécharger .ics',
    exportIcsSuccess: 'Calendrier prêt !',
    exportPdfLandscapeTitle: 'Planning Gantt PDF (A4 / A3 Paysage)',
    exportPdfLandscapeDesc: "Génère le diagramme complet vectoriel prêt pour l'impression grand format ou intégration de planche.",
    exportPdfLandscapeA4: 'PDF A4',
    exportPdfLandscapeA3: 'PDF A3',
    exportPdfA4Success: 'PDF A4 prêt !',
    exportPdfA3Success: 'PDF A3 prêt !',
    exportPdfA4Tooltip: 'Télécharger en format A4 Paysage',
    exportPdfA3Tooltip: 'Télécharger en grand format A3 Paysage',
    exportScaleLabel: 'Échelle de temps du PNG :',
    launchPresentationMode: 'Lancer le mode',
    presentationModeCardDesc: 'Vue grand écran épurée conçue pour projeter le Gantt devant votre jury ou classe.',

    // Multi-views
    viewGantt: 'Gantt',
    viewKanban: 'Kanban',
    viewList: 'Liste',
    viewCalendar: 'Calendrier',
    viewSwitcherTooltip: 'Changer de vue (Gantt, Kanban, Liste, Calendrier)',

    // Kanban
    kanbanTodo: 'À faire',
    kanbanInProgress: 'En cours',
    kanbanReview: 'En révision',
    kanbanDone: 'Terminé',
    kanbanAddTask: 'Ajouter une tâche',
    kanbanNoTasks: 'Aucune tâche dans cette colonne',
    kanbanDropHere: 'Déposer ici',

    // List View
    listColName: 'Nom de la tâche / Jalon',
    listColType: 'Type',
    listColDates: 'Dates',
    listColDuration: 'Durée',
    listColProgress: 'Progression',
    listColAssignee: 'Responsable',
    listColMode: 'Mode',
    listColStatus: 'Statut',
    listColActions: 'Actions',
    listQuickAdd: 'Ajouter un élément',
    listTotalTasks: 'tâche(s)',

    // Calendar View
    calendarToday: "Aujourd'hui",
    calendarMonth: 'Mois',
    calendarPrevMonth: 'Mois précédent',
    calendarNextMonth: 'Mois suivant',
    calendarAddTaskAtDate: 'Créer une tâche à cette date',
    calendarNoTasksThisDay: 'Aucune tâche prévue ce jour',

    // Comments Notification
    commentsModalTitle: 'Commentaires du projet',
    commentsModalSubtitle: 'Fil de discussion et remarques sur les tâches',
    commentsCount: 'commentaire(s)',
    commentsEmpty: 'Aucun commentaire pour le moment',
    commentsEmptyDesc: 'Les commentaires ajoutés dans la fiche d’une tâche apparaîtront ici chronologiquement.',
    commentsOpenTask: 'Ouvrir la tâche',
    commentsSearchPlaceholder: 'Rechercher un commentaire, un auteur ou une tâche...',
  },

  de: {
    appName: 'Gantt For Student',
    appTagline: 'Einfache und moderne Planung',
    aiDisclaimer: 'Mit KI erstellt, Benutzung auf eigene Gefahr.',
    downloadWindows: 'Für Windows herunterladen',
    downloadWindowsSubtitle: 'Desktop-Anwendung für Windows-PC verfügbar',
    windowsApp: 'Windows-App',
    
    createProject: 'Neues Projekt erstellen',
    createProjectDesc: 'Erstellen Sie einen eindeutigen Code und starten Sie sofort mit Ihrem Diagramm.',
    enterProjectCode: 'Mit Code öffnen',
    enterProjectCodeDesc: 'Geben Sie Ihren Code ein, um Ihr Projekt auf jedem Gerät abzurufen.',
    projectCodePlaceholder: 'Z.B.: PROJ-2026',
    openProject: 'Projekt öffnen',
    newProjectTitle: 'Projekttitel',
    projectTitlePlaceholder: 'Z.B.: Semesterarbeit, Bachelorarbeit, Gruppenprojekt...',
    projectCodeCustomPlaceholder: 'Benutzerdefinierter Code (optional, z.B.: INFO-2026)',
    createButton: 'Gantt erstellen',
    recentProjects: 'Kürzlich geöffnete Projekte',
    noRecentProjects: 'Keine kürzlich geöffneten Projekte auf diesem Browser.',
    exploreDemo: 'Beispielprojekt ansehen',
    codeHelp: 'Öffnen Sie Ihr Projekt überall über den Code oder direkt per URL-Link.',
    invalidCode: 'Bitte geben Sie einen gültigen Projektcode ein.',
    projectNotFound: 'Kein Projekt für diesen Code gefunden.',
    copyCode: 'Code kopieren',
    codeCopied: 'Code kopiert!',
    shareUrl: 'Link teilen',
    urlCopied: 'Link in die Zwischenablage kopiert!',

    homeAccessOrCreateTitle: 'Mit einem eindeutigen Code öffnen oder erstellen',
    homeProjectCodeLabel: 'Projektcode',
    homeProjectCodePlaceholder: 'Z.B.: PROJEKT-INFO, MASTER-2026...',
    homeCodeHint: '💡 Falls der Code bereits existiert, gelangen Sie direkt zu Ihrem Gantt. Andernfalls können Sie ihn sofort erstellen! (Code nicht mit $ beginnen)',
    homeAccessButton: 'Zum Gantt-Diagramm',
    homeRandomCodeButton: 'Zufälliger Code',
    homeRandomCodeTooltip: 'Automatisch einen Zufallscode generieren',
    homeNeedExample: 'Brauchen Sie ein Beispiel?',
    homeNewProjectDetected: 'Neues Projekt erkannt',
    homeNewProjectCodeNotice: 'existiert noch nicht. Geben Sie Ihrem Projekt einen Namen:',
    homeProjectNameLabel: 'Projektname *',
    homeProjectNamePlaceholder: 'Z.B.: Semesterprojekt 2 - Gruppe A',
    homeBackButton: 'Zurück',
    homeCreateAndOpenButton: 'Gantt erstellen und öffnen',
    homeItemsCount: 'Elemente',
    homeRemoveFromHistoryTooltip: 'Aus dem Verlauf entfernen',
    homeFooterText: 'Gantt For Student · Konzipiert für Einzel- und Gruppenarbeiten',

    backToHome: 'Alle Projekte',
    today: 'Heute',
    zoom: 'Zoom',
    zoomDays: 'Tage',
    zoomWeeks: 'Wochen',
    zoomMonths: 'Monate',
    zoomYears: 'Jahre',
    exportPresentation: 'Exportieren',
    presentationMode: 'Präsentationsmodus',
    exitPresentation: 'Präsentation beenden',
    addTask: 'Aufgabe hinzufügen',
    addGroup: 'Gruppe erstellen',
    addMilestone: 'Meilenstein setzen',
    sidebarToggle: 'Liste einklappen',
    saveStatus: 'Lokal gespeichert',

    itemName: 'Name',
    itemType: 'Typ',
    itemDates: 'Termine',
    itemDuration: 'Dauer',
    itemProgress: 'Fortschritt',
    itemMode: 'Planung',
    itemPredecessor: 'Abhängigkeit',
    actions: 'Aktionen',
    noItemsYet: 'Noch keine Elemente',
    noItemsDesc: 'Fügen Sie oben die erste Aufgabe, Gruppe oder einen Meilenstein hinzu.',

    task: 'Aufgabe',
    group: 'Gruppe',
    milestone: 'Meilenstein',
    manual: 'Manuell (festes Datum)',
    manualDesc: 'Start- und Enddatum manuell festgelegt.',
    auto: 'Automatisch (nach Vorgänger)',
    autoDesc: 'Startet automatisch nach Beendigung der Vorgängeraufgabe.',

    editItem: 'Element bearbeiten',
    newItem: 'Neues Element',
    titleLabel: 'Titel',
    typeLabel: 'Elementtyp',
    schedulingLabel: 'Planungsmodus',
    predecessorLabel: 'Vorgängeraufgabe',
    noPredecessor: 'Kein Vorgänger (unabhängig)',
    lagLabel: 'Verzögerung nach Vorgänger',
    lagDays: 'Tag(e)',
    predecessorManualDesc: 'Zeigt einen Verbindungspfeil im Diagramm an, ohne die manuellen Daten zu verändern.',
    predecessorGroupDesc: 'Zeigt einen Abhängigkeitspfeil zu dieser Gruppe im Gantt-Diagramm an.',
    startDateLabel: 'Startdatum',
    endDateLabel: 'Enddatum',
    durationLabel: 'Dauer',
    days: 'Tage',
    dayShort: 'T',
    progressLabel: 'Fortschritt',
    colorLabel: 'Farbe',
    groupParentLabel: 'Zugehörige Gruppe',
    noParentGroup: 'Keine Gruppe (Hauptebene)',
    assigneeLabel: 'Zuständige Person / Student',
    selectAssigneePlaceholder: 'Bestehendes Mitglied wählen...',
    newAssigneePrompt: '+ Neues Mitglied',
    unassigned: 'Nicht zugewiesen',
    quickTeamMembers: 'Teammitglieder:',
    teamMembersTitle: 'Team & Zuständige',
    teamMembersDesc: 'Erfassen Sie die Teammitglieder einmalig, um sie im gesamten Projekt mit einem Klick zuzuweisen.',
    manageTeamButton: 'Team',
    notesLabel: 'Notizen & Ergebnisse',
    saveItem: 'Speichern',
    cancel: 'Abbrechen',
    deleteItem: 'Löschen',
    confirmDelete: 'Möchten Sie dieses Element wirklich löschen?',

    exportModalTitle: 'Für Präsentation exportieren',
    exportModalDesc: 'Formate für Kolloquien, Folienvorträge und Projektberichte.',
    exportPngTitle: 'Hochauflösendes Bild (PNG)',
    exportPngDesc: 'Erzeugt ein sauberes Bild für PowerPoint, Keynote oder Google Slides.',
    downloadPngButton: 'PNG-Bild herunterladen',
    exportPdfTitle: 'Präsentationsfolie / PDF',
    exportPdfDesc: 'Optimiert für Vollbild-Projektion oder PDF-Ausdruck im Querformat.',
    printPdfButton: 'Drucken / Als PDF speichern',
    exportJsonTitle: 'Projektsicherung (JSON)',
    exportJsonDesc: 'Laden Sie die Projektdatei herunter, um sie mit Teammitgliedern zu teilen.',
    downloadJsonButton: '.json-Datei herunterladen',
    importJsonTitle: 'JSON-Projekt importieren',
    importJsonDesc: 'Ein zuvor exportiertes Projekt wieder laden.',
    uploadJsonButton: '.json-Datei laden',
    presentationSlideTip: 'Tipp: Nutzen Sie den "Präsentationsmodus" direkt im Vollbild während Ihrer Verteidigung.',
    exporting: 'Wird erstellt...',

    statsTasks: 'Aufgaben',
    statsGroups: 'Gruppen',
    statsMilestones: 'Meilensteine',
    statsCompletion: 'Gesamtfortschritt',
    timeframe: 'Projektzeitraum',
    weekend: 'Wochenende',

    collabBadge: 'EXPERIMENTELLE FUNKTION',
    collabModalTitle: 'Live-Zusammenarbeit (P2P)',
    collabModalSubtitle: 'Sofortige Echtzeit-Synchronisation auf demselben Gantt-Diagramm',
    collabStatusConnected: 'Live verbunden · Echtzeit-Kanal aktiv',
    collabStatusConnecting: 'Verbindung zum Peer-Netzwerk...',
    collabStatusOffline: 'Offline · Lokale Speicherung beibehalten',
    collabPrivateBadge: '100% Privat',
    collabShareSectionTitle: 'Projekt mit Kollegen teilen',
    collabShareSectionDesc: 'Jeder, der diesen Link öffnet oder diesen Code eingibt, tritt automatisch Ihrer Live-Sitzung bei. Änderungen werden sofort übertragen!',
    collabCodeLabel: 'Code:',
    collabCopyCode: 'Code kopieren',
    collabCopyLink: 'Kopieren',
    collabCopied: 'Kopiert!',
    collabProfileTitle: 'Mein Mitarbeiter-Profil',
    collabProfileSaved: 'Gespeichert',
    collabNamePlaceholder: 'Ihr Name oder Nickname (z.B.: Lukas)',
    collabValidate: 'Bestätigen',
    collabAvatarColor: 'Avatar-Farbe:',
    collabActiveUsersTitle: 'Mitarbeiter in diesem Projekt',
    collabLive: 'Live',
    collabOnline: 'Online',
    collabYouBadge: 'Sie',
    collabFirstUser: 'Sie sind der Erste in diesem Projekt. Teilen Sie den Link, um Kollegen einzuladen!',
    collabRecentSync: 'Zuletzt synchronisierte Aktionen',
    collabFooterTip: 'Änderungen werden kontinuierlich übertragen',
    collabHeaderButton: 'Zusammenarbeiten',
    collabHeaderLive: 'live',
    collabHeaderTooltip: 'Live zusammenarbeiten (P2P Multi-User)',
    collabUserJoined: 'ist der Sitzung beigetreten',
    collabUserLeft: 'hat die Sitzung verlassen',
    collabUpdatedGantt: 'hat das Gantt-Diagramm aktualisiert',
    close: 'Schließen',

    filterLabel: 'Filter:',
    searchTasksPlaceholder: 'Aufgabe suchen...',
    allMembers: 'Alle Mitglieder',
    unassigned: 'Nicht zugewiesen',
    lateFilter: 'Überfällig',
    lateFilterTooltip: 'Nur überfällige Aufgaben anzeigen',
    milestonesFilter: 'Meilensteine',
    milestonesFilterTooltip: 'Nur wichtige Meilensteine anzeigen',
    filterAll: 'Alle',
    filterTodo: 'Zu erledigen',
    filterInProgress: 'In Bearbeitung',
    filterDone: 'Erledigt',
    filterTodoTooltip: 'Aufgaben bei 0%',
    filterInProgressTooltip: 'Aufgaben zwischen 1% und 99%',
    filterDoneTooltip: 'Aufgaben zu 100% abgeschlossen',
    resetFilters: 'Zurücksetzen',
    resetFiltersTooltip: 'Alle Filter zurücksetzen',
    filterToggleShow: 'Filterleiste anzeigen',
    filterToggleHide: 'Filterleiste ausblenden',

    dragToLinkDotTooltip: 'Direkte Verknüpfung (Drag-to-Link): Ziehen Sie diesen Punkt auf eine andere Aufgabe, um eine Abhängigkeit zu erstellen',
    dragToLinkReleaseTarget: 'Loslassen zum Verknüpfen mit',
    dragToLinkConnecting: 'Verknüpfung: Ziehen Sie zu einer abhängigen Aufgabe...',
    dragToLinkConnectTo: 'Verknüpfen mit:',
    dragResizeDurationTooltip: 'Ziehen, um die Dauer (Tage) zu verlängern oder zu verkürzen',
    dragResizeStartTooltip: 'Ziehen, um das Startdatum anzupassen',
    dragMoveUp: '↑ Nach oben',
    dragMoveDown: '↓ Nach unten',

    workloadButton: 'Auslastung',
    workloadTooltip: 'Verwaltung der Team-Arbeitslast',
    presentationButtonTooltip: 'Vollbild-Präsentationsmodus (Taste P)',
    exportButtonTooltip: 'Projekt exportieren (PDF, PNG, JSON - Taste E)',
    shortcutsTooltip: 'Tastaturkürzel (Taste ?)',
    notificationsTooltip: 'Meilenstein-Erinnerungen & Fristbenachrichtigungen',
    readOnlyBadge: 'Schreibgeschützt',
    readOnlyTooltip: 'Ansichtsmodus (Nur Lesen)',
    centerTodayTooltip: 'Auf heute zentrieren',
    undoTooltip: 'Rückgängig (Strg+Z)',
    redoTooltip: 'Wiederholen (Strg+Y)',
    themeLight: 'Helles Design (Weiß)',
    themeDark: 'Dunkles Design',
    toggleThemeTooltip: 'Zwischen dunklem und weißem Design wechseln',

    exportOnePagerTitle: 'Management-Zusammenfassung für Prüfer · One-Pager (PDF)',
    exportOnePagerDesc: 'Zusammenfassung im A4-Hochformat: Kennzahlen, Meilensteine, Projektphasen und Teamverteilung. Ideal für Berichte und Kolloquien.',
    exportOnePagerBadge: 'Spezial Kolloquium',
    exportOnePagerButton: 'One-Pager erstellen',
    exportOnePagerSuccess: 'Heruntergeladen!',
    exportIcsTitle: 'Kalender-Export (.ics)',
    exportIcsDesc: 'Synchronisieren Sie Aufgaben und Meilensteine mit Google Kalender, Apple Kalender oder Outlook.',
    exportIcsButton: '.ics herunterladen',
    exportIcsSuccess: 'Kalender bereit!',
    exportPdfLandscapeTitle: 'Gantt-Planung als PDF (A4 / A3 Querformat)',
    exportPdfLandscapeDesc: 'Erzeugt ein vollständiges Vektordiagramm für Großformatdruck oder Berichte.',
    exportPdfLandscapeA4: 'PDF A4',
    exportPdfLandscapeA3: 'PDF A3',
    exportPdfA4Success: 'PDF A4 bereit!',
    exportPdfA3Success: 'PDF A3 bereit!',
    exportPdfA4Tooltip: 'Als A4-Querformat herunterladen',
    exportPdfA3Tooltip: 'Als A3-Querformat herunterladen',
    exportScaleLabel: 'PNG-Zeitskala:',
    launchPresentationMode: 'Modus starten',
    presentationModeCardDesc: 'Klare Vollbildansicht zur Projektion vor Prüfern oder im Kurs.',

    // Multi-views
    viewGantt: 'Gantt',
    viewKanban: 'Kanban',
    viewList: 'Liste',
    viewCalendar: 'Kalender',
    viewSwitcherTooltip: 'Ansicht wechseln (Gantt, Kanban, Liste, Kalender)',

    // Kanban
    kanbanTodo: 'Zu erledigen',
    kanbanInProgress: 'In Bearbeitung',
    kanbanReview: 'In Prüfung',
    kanbanDone: 'Erledigt',
    kanbanAddTask: 'Aufgabe hinzufügen',
    kanbanNoTasks: 'Keine Aufgaben in dieser Spalte',
    kanbanDropHere: 'Hier ablegen',

    // List View
    listColName: 'Aufgabenname / Meilenstein',
    listColType: 'Typ',
    listColDates: 'Termine',
    listColDuration: 'Dauer',
    listColProgress: 'Fortschritt',
    listColAssignee: 'Zuständig',
    listColMode: 'Modus',
    listColStatus: 'Status',
    listColActions: 'Aktionen',
    listQuickAdd: 'Element hinzufügen',
    listTotalTasks: 'Aufgabe(n)',

    // Calendar View
    calendarToday: 'Heute',
    calendarMonth: 'Monat',
    calendarPrevMonth: 'Vorheriger Monat',
    calendarNextMonth: 'Nächster Monat',
    calendarAddTaskAtDate: 'Aufgabe an diesem Datum erstellen',
    calendarNoTasksThisDay: 'Keine Aufgaben an diesem Tag geplant',

    // Comments Notification
    commentsModalTitle: 'Projektkommentare',
    commentsModalSubtitle: 'Diskussionsfaden und Anmerkungen zu Aufgaben',
    commentsCount: 'Kommentar(e)',
    commentsEmpty: 'Noch keine Kommentare vorhanden',
    commentsEmptyDesc: 'In Aufgaben hinzugefügte Kommentare werden hier chronologisch aufgeführt.',
    commentsOpenTask: 'Aufgabe öffnen',
    commentsSearchPlaceholder: 'Kommentar, Autor oder Aufgabe suchen...',
  },

  it: {
    appName: 'Gantt For Student',
    appTagline: 'Pianificazione semplice e moderna',
    aiDisclaimer: "Creato con l'IA, a proprio rischio e pericolo.",
    downloadWindows: 'Scarica per Windows',
    downloadWindowsSubtitle: 'Applicazione desktop disponibile per PC Windows',
    windowsApp: 'App Windows',
    
    createProject: 'Crea un nuovo progetto',
    createProjectDesc: 'Genera un codice unico e inizia subito il tuo diagramma.',
    enterProjectCode: 'Apri con un codice',
    enterProjectCodeDesc: 'Inserisci il tuo codice univoco per ritrovare il progetto da qualsiasi postazione.',
    projectCodePlaceholder: 'Es: PROJ-2026',
    openProject: 'Apri il progetto',
    newProjectTitle: 'Titolo del progetto',
    projectTitlePlaceholder: 'Es: Progetto di semestre, Tesi, Relazione di gruppo...',
    projectCodeCustomPlaceholder: 'Codice personalizzato (opzionale, es: INGEGNERIA-26)',
    createButton: 'Crea il Gantt',
    recentProjects: 'I tuoi progetti recenti',
    noRecentProjects: 'Nessun progetto aperto di recente su questo browser.',
    exploreDemo: 'Esplora progetto di esempio',
    codeHelp: 'Ritrova il tuo progetto ovunque grazie al codice o tramite link URL.',
    invalidCode: 'Inserisci un codice progetto valido.',
    projectNotFound: 'Nessun progetto trovato per questo codice.',
    copyCode: 'Copia codice',
    codeCopied: 'Codice copiato!',
    shareUrl: 'Condividi link',
    urlCopied: 'Link copiato negli appunti!',

    homeAccessOrCreateTitle: 'Accedi o crea con un codice univoco',
    homeProjectCodeLabel: 'Codice del progetto',
    homeProjectCodePlaceholder: 'Es: PROGETTO-INFO, TESI-2026...',
    homeCodeHint: '💡 Se il codice esiste già, accedi direttamente al tuo Gantt. Altrimenti potrai crearlo subito! (Non iniziare il codice con $)',
    homeAccessButton: 'Accedi al Gantt',
    homeRandomCodeButton: 'Codice casuale',
    homeRandomCodeTooltip: 'Genera automaticamente un codice casuale',
    homeNeedExample: 'Hai bisogno di un esempio?',
    homeNewProjectDetected: 'Nuovo progetto rilevato',
    homeNewProjectCodeNotice: 'non esiste ancora. Dai un nome al tuo progetto per crearlo:',
    homeProjectNameLabel: 'Nome del progetto *',
    homeProjectNamePlaceholder: 'Es: Progetto Semestre 2 - Gruppo A',
    homeBackButton: 'Indietro',
    homeCreateAndOpenButton: 'Crea e apri il Gantt',
    homeItemsCount: 'elementi',
    homeRemoveFromHistoryTooltip: 'Rimuovi dalla cronologia',
    homeFooterText: 'Gantt For Student · Progettato per progetti individuali e di gruppo',

    backToHome: 'Tutti i progetti',
    today: 'Oggi',
    zoom: 'Scala',
    zoomDays: 'Giorni',
    zoomWeeks: 'Settimane',
    zoomMonths: 'Mesi',
    zoomYears: 'Anni',
    exportPresentation: 'Esporta',
    presentationMode: 'Modalità Presentazione',
    exitPresentation: 'Esci dalla presentazione',
    addTask: 'Aggiungi attività',
    addGroup: 'Crea gruppo',
    addMilestone: 'Inserisci pietra miliare',
    sidebarToggle: 'Nascondi elenco',
    saveStatus: 'Salvato localmente',

    itemName: 'Nome',
    itemType: 'Tipo',
    itemDates: 'Date',
    itemDuration: 'Durata',
    itemProgress: 'Avanzamento',
    itemMode: 'Pianificazione',
    itemPredecessor: 'Dipendenza',
    actions: 'Azioni',
    noItemsYet: 'Nessun elemento per ora',
    noItemsDesc: 'Inizia aggiungendo la prima attività, gruppo o pietra miliare con i pulsanti in alto.',

    task: 'Attività',
    group: 'Gruppo',
    milestone: 'Pietra miliare',
    manual: 'Manuale (data fissa)',
    manualDesc: 'Date di inizio e fine impostate manualmente.',
    auto: 'Automatico (dipendenza)',
    autoDesc: 'Inizia subito dopo la fine dell’attività precedente.',

    editItem: 'Modifica elemento',
    newItem: 'Nuovo elemento',
    titleLabel: 'Titolo',
    typeLabel: 'Tipo di elemento',
    schedulingLabel: 'Modalità di pianificazione',
    predecessorLabel: 'Attività precedente (predecessore)',
    noPredecessor: 'Nessun predecessore (indipendente)',
    lagLabel: 'Ritardo dopo l’attività precedente',
    lagDays: 'giorno/i',
    predecessorManualDesc: 'Mostra una freccia di collegamento nel diagramma senza modificare le date manuali.',
    predecessorGroupDesc: 'Mostra una freccia di dipendenza verso questo gruppo nel diagramma di Gantt.',
    startDateLabel: 'Data di inizio',
    endDateLabel: 'Data di fine',
    durationLabel: 'Durata',
    days: 'giorni',
    dayShort: 'g',
    progressLabel: 'Avanzamento',
    colorLabel: 'Colore',
    groupParentLabel: 'Appartiene al gruppo',
    noParentGroup: 'Nessun gruppo (radice)',
    assigneeLabel: 'Responsabile / Studente',
    selectAssigneePlaceholder: 'Scegli un membro esistente...',
    newAssigneePrompt: '+ Nuovo membro',
    unassigned: 'Non assegnato',
    quickTeamMembers: 'Membri del team:',
    teamMembersTitle: 'Team e Responsabili',
    teamMembersDesc: 'Definisci i membri del gruppo una sola volta per assegnarli con un solo clic in tutto il progetto.',
    manageTeamButton: 'Team',
    notesLabel: 'Note e risultati',
    saveItem: 'Salva',
    cancel: 'Annulla',
    deleteItem: 'Elimina',
    confirmDelete: 'Sei sicuro di voler eliminare questo elemento?',

    exportModalTitle: 'Esporta per presentazione',
    exportModalDesc: 'Formati per tesi, slide diapositive e relazioni di gruppo.',
    exportPngTitle: 'Immagine ad alta risoluzione (PNG)',
    exportPngDesc: 'Crea un’immagine nitida pronta per PowerPoint, Keynote o Google Slides.',
    downloadPngButton: 'Scarica immagine PNG',
    exportPdfTitle: 'Formato Slide / Stampa (PDF)',
    exportPdfDesc: 'Ottimizzato per proiezione su schermo o esportazione PDF in formato orizzontale.',
    printPdfButton: 'Stampa / Salva in PDF',
    exportJsonTitle: 'Backup del file progetto (JSON)',
    exportJsonDesc: 'Scarica i dati del progetto per conservarli o condividerli coi compagni.',
    downloadJsonButton: 'Scarica file .json',
    importJsonTitle: 'Importa progetto JSON',
    importJsonDesc: 'Carica un progetto salvato in questo formato per modificarlo.',
    uploadJsonButton: 'Carica file .json',
    presentationSlideTip: 'Suggerimento: Puoi usare direttamente la "Modalità Presentazione" a schermo intero durante il tuo esame orale.',
    exporting: 'Generazione in corso...',

    statsTasks: 'Attività',
    statsGroups: 'Gruppi',
    statsMilestones: 'Pietre miliari',
    statsCompletion: 'Avanzamento totale',
    timeframe: 'Periodo del progetto',
    weekend: 'Fine settimana',

    collabBadge: 'FUNZIONALITÀ SPERIMENTALE',
    collabModalTitle: 'Collaborazione dal Vivo (P2P)',
    collabModalSubtitle: 'Sincronizzazione istantanea multiutente sullo stesso diagramma di Gantt',
    collabStatusConnected: 'Connesso dal vivo · Canale in tempo reale attivo',
    collabStatusConnecting: 'Connessione alla rete di colleghi...',
    collabStatusOffline: 'Offline · Salvataggio locale mantenuto',
    collabPrivateBadge: '100% Privato',
    collabShareSectionTitle: 'Condividi questo progetto con i compagni',
    collabShareSectionDesc: 'Chiunque apra questo link o inserisca questo codice si unirà automaticamente alla tua sessione live. Le modifiche si sincronizzano all’istante!',
    collabCodeLabel: 'Codice:',
    collabCopyCode: 'Copia Codice',
    collabCopyLink: 'Copia',
    collabCopied: 'Copiato!',
    collabProfileTitle: 'La mia identità di collaboratore',
    collabProfileSaved: 'Salvato',
    collabNamePlaceholder: 'Il tuo nome o nickname (es: Marco)',
    collabValidate: 'Conferma',
    collabAvatarColor: 'Colore avatar:',
    collabActiveUsersTitle: 'Collaboratori su questo progetto',
    collabLive: 'In diretta',
    collabOnline: 'Online',
    collabYouBadge: 'Tu',
    collabFirstUser: 'Sei il primo in questo progetto. Condividi il link per invitare i tuoi compagni!',
    collabRecentSync: 'Ultime azioni sincronizzate',
    collabFooterTip: 'Modifiche trasmesse continuamente',
    collabHeaderButton: 'Collabora',
    collabHeaderLive: 'in diretta',
    collabHeaderTooltip: 'Collaborazione in diretta (P2P multiutente)',
    collabUserJoined: 'si è unito/a alla sessione',
    collabUserLeft: 'ha lasciato la sessione',
    collabUpdatedGantt: 'ha aggiornato il diagramma di Gantt',
    close: 'Chiudi',

    filterLabel: 'Filtri:',
    searchTasksPlaceholder: 'Cerca un’attività...',
    allMembers: 'Tutti i membri',
    unassigned: 'Non assegnato',
    lateFilter: 'In ritardo',
    lateFilterTooltip: 'Mostra solo le attività in ritardo con scadenza superata',
    milestonesFilter: 'Pietre miliari',
    milestonesFilterTooltip: 'Mostra solo le pietre miliari chiave',
    filterAll: 'Tutti',
    filterTodo: 'Da fare',
    filterInProgress: 'In corso',
    filterDone: 'Completato',
    filterTodoTooltip: 'Attività a 0%',
    filterInProgressTooltip: 'Attività tra 1% e 99%',
    filterDoneTooltip: 'Attività completate al 100%',
    resetFilters: 'Azzera',
    resetFiltersTooltip: 'Reimposta tutti i filtri',
    filterToggleShow: 'Mostra barra dei filtri',
    filterToggleHide: 'Nascondi barra dei filtri',

    dragToLinkDotTooltip: 'Collegamento diretto (Drag-to-link): fai clic e trascina questo punto bianco su un’altra attività per creare una dipendenza',
    dragToLinkReleaseTarget: 'Rilascia per collegare a',
    dragToLinkConnecting: 'Collegamento: trascina verso un’attività dipendente...',
    dragToLinkConnectTo: 'Collega a:',
    dragResizeDurationTooltip: 'Trascina per allungare o accorciare la durata (giorni)',
    dragResizeStartTooltip: 'Trascina per modificare la data di inizio',
    dragMoveUp: '↑ Su',
    dragMoveDown: '↓ Giù',

    workloadButton: 'Carichi',
    workloadTooltip: 'Gestione dei carichi di lavoro del team',
    presentationButtonTooltip: 'Modalità presentazione a schermo intero (Tasto P)',
    exportButtonTooltip: 'Esporta progetto (PDF, PNG, JSON - Tasto E)',
    shortcutsTooltip: 'Scorciatoie da tastiera (Tasto ?)',
    notificationsTooltip: 'Promemoria scadenze e pietre miliari',
    readOnlyBadge: 'Sola lettura',
    readOnlyTooltip: 'Modalità consultazione (Sola lettura)',
    centerTodayTooltip: 'Centra la vista su oggi',
    undoTooltip: 'Annulla (Ctrl+Z)',
    redoTooltip: 'Ripristina (Ctrl+Y)',
    themeLight: 'Tema chiaro (Bianco)',
    themeDark: 'Tema scuro',
    toggleThemeTooltip: 'Passa dal tema scuro a quello bianco',

    exportOnePagerTitle: 'Scheda sintetica per la commissione · One-Pager (PDF)',
    exportOnePagerDesc: 'Sintesi esecutiva in formato A4 verticale: metriche chiave, pietre miliari, suddivisione per fasi e carichi di lavoro. Ideale per la discussione.',
    exportOnePagerBadge: 'Speciale Esame',
    exportOnePagerButton: 'Genera One-Pager',
    exportOnePagerSuccess: 'Scaricato!',
    exportIcsTitle: 'Esporta Calendario (.ics)',
    exportIcsDesc: 'Sincronizza attività e scadenze in Google Calendar, Apple Calendario o Outlook con notifiche automatiche.',
    exportIcsButton: 'Scarica .ics',
    exportIcsSuccess: 'Calendario pronto!',
    exportPdfLandscapeTitle: 'Pianificazione Gantt in PDF (A4 / A3 Orizzontale)',
    exportPdfLandscapeDesc: 'Genera il diagramma vettoriale completo pronto per la stampa o la consegna.',
    exportPdfLandscapeA4: 'PDF A4',
    exportPdfLandscapeA3: 'PDF A3',
    exportPdfA4Success: 'PDF A4 pronto!',
    exportPdfA3Success: 'PDF A3 pronto!',
    exportPdfA4Tooltip: 'Scarica in formato A4 Orizzontale',
    exportPdfA3Tooltip: 'Scarica in formato A3 Orizzontale',
    exportScaleLabel: 'Scala temporale PNG:',
    launchPresentationMode: 'Avvia modalità',
    presentationModeCardDesc: 'Vista a schermo intero pulita pensata per proiettare il Gantt durante la discussione.',

    // Multi-views
    viewGantt: 'Gantt',
    viewKanban: 'Kanban',
    viewList: 'Elenco',
    viewCalendar: 'Calendario',
    viewSwitcherTooltip: 'Cambia vista (Gantt, Kanban, Elenco, Calendario)',

    // Kanban
    kanbanTodo: 'Da fare',
    kanbanInProgress: 'In corso',
    kanbanReview: 'In revisione',
    kanbanDone: 'Completato',
    kanbanAddTask: 'Aggiungi attività',
    kanbanNoTasks: 'Nessuna attività in questa colonna',
    kanbanDropHere: 'Rilascia qui',

    // List View
    listColName: 'Nome attività / Pietra miliare',
    listColType: 'Tipo',
    listColDates: 'Date',
    listColDuration: 'Durata',
    listColProgress: 'Avanzamento',
    listColAssignee: 'Responsabile',
    listColMode: 'Modalità',
    listColStatus: 'Stato',
    listColActions: 'Azioni',
    listQuickAdd: 'Aggiungi elemento',
    listTotalTasks: 'attività',

    // Calendar View
    calendarToday: 'Oggi',
    calendarMonth: 'Mese',
    calendarPrevMonth: 'Mese precedente',
    calendarNextMonth: 'Mese successivo',
    calendarAddTaskAtDate: 'Crea attività in questa data',
    calendarNoTasksThisDay: 'Nessuna attività pianificata per oggi',

    // Comments Notification
    commentsModalTitle: 'Commenti del progetto',
    commentsModalSubtitle: 'Discussioni e note sulle attività',
    commentsCount: 'commento/i',
    commentsEmpty: 'Nessun commento finora',
    commentsEmptyDesc: 'I commenti aggiunti ai dettagli delle attività appariranno qui.',
    commentsOpenTask: 'Apri attività',
    commentsSearchPlaceholder: 'Cerca un commento, un autore o un’attività...',
  },

  en: {
    appName: 'Gantt For Student',
    appTagline: 'Simple and modern planning',
    aiDisclaimer: 'Created with AI, at your own risk.',
    downloadWindows: 'Download for Windows',
    downloadWindowsSubtitle: 'Desktop application available for Windows PC',
    windowsApp: 'Windows App',
    
    createProject: 'Create New Project',
    createProjectDesc: 'Generate a unique code and start your Gantt chart immediately.',
    enterProjectCode: 'Open with Code',
    enterProjectCodeDesc: 'Enter your unique code to retrieve your project from any computer.',
    projectCodePlaceholder: 'E.g.: PROJ-2026',
    openProject: 'Open Project',
    newProjectTitle: 'Project Title',
    projectTitlePlaceholder: 'E.g.: Semester Thesis, Final Capstone, Lab Assignment...',
    projectCodeCustomPlaceholder: 'Custom code (optional, e.g.: CS-CAPSTONE)',
    createButton: 'Create Gantt',
    recentProjects: 'Recent Projects',
    noRecentProjects: 'No recent projects opened in this browser yet.',
    exploreDemo: 'Explore Sample Project',
    codeHelp: 'Reopen your project anywhere using its unique code or direct link.',
    invalidCode: 'Please enter a valid project code.',
    projectNotFound: 'No project found for this code.',
    copyCode: 'Copy Code',
    codeCopied: 'Code copied!',
    shareUrl: 'Share Link',
    urlCopied: 'Link copied to clipboard!',

    homeAccessOrCreateTitle: 'Access or create with a unique code',
    homeProjectCodeLabel: 'Project code',
    homeProjectCodePlaceholder: 'E.g.: CS-PROJECT, THESIS-2026...',
    homeCodeHint: '💡 If the code already exists, you will jump straight to your Gantt. Otherwise, you can create it right away! (Do not start a code with $)',
    homeAccessButton: 'Open Gantt',
    homeRandomCodeButton: 'Random code',
    homeRandomCodeTooltip: 'Generate a random code automatically',
    homeNeedExample: 'Need an example?',
    homeNewProjectDetected: 'New project detected',
    homeNewProjectCodeNotice: 'does not exist yet. Name your project to create it:',
    homeProjectNameLabel: 'Project name *',
    homeProjectNamePlaceholder: 'E.g.: Semester 2 Project - Team A',
    homeBackButton: 'Back',
    homeCreateAndOpenButton: 'Create and open Gantt',
    homeItemsCount: 'items',
    homeRemoveFromHistoryTooltip: 'Remove from history',
    homeFooterText: 'Gantt For Student · Built for solo and group projects',

    backToHome: 'All Projects',
    today: 'Today',
    zoom: 'Zoom',
    zoomDays: 'Days',
    zoomWeeks: 'Weeks',
    zoomMonths: 'Months',
    zoomYears: 'Years',
    exportPresentation: 'Export',
    presentationMode: 'Presentation Mode',
    exitPresentation: 'Exit Presentation',
    addTask: 'Add Task',
    addGroup: 'Create Group',
    addMilestone: 'Place Milestone',
    sidebarToggle: 'Toggle Task List',
    saveStatus: 'Saved locally',

    itemName: 'Name',
    itemType: 'Type',
    itemDates: 'Dates',
    itemDuration: 'Duration',
    itemProgress: 'Progress',
    itemMode: 'Scheduling',
    itemPredecessor: 'Dependency',
    actions: 'Actions',
    noItemsYet: 'No items yet',
    noItemsDesc: 'Start by adding your first task, group, or milestone using the buttons above.',

    task: 'Task',
    group: 'Group',
    milestone: 'Milestone',
    manual: 'Manual (Fixed date)',
    manualDesc: 'Start and end dates explicitly set by hand.',
    auto: 'Automatic (Predecessor-based)',
    autoDesc: 'Automatically starts right after the predecessor task completes.',

    editItem: 'Edit Item',
    newItem: 'New Item',
    titleLabel: 'Title',
    typeLabel: 'Item Type',
    schedulingLabel: 'Scheduling Mode',
    predecessorLabel: 'Predecessor Task',
    noPredecessor: 'No predecessor (Independent)',
    lagLabel: 'Lag / Delay after predecessor',
    lagDays: 'day(s)',
    predecessorManualDesc: 'Displays a link arrow in the chart without modifying your manual dates.',
    predecessorGroupDesc: 'Displays a dependency arrow pointing to this group in the Gantt chart.',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date',
    durationLabel: 'Duration',
    days: 'days',
    dayShort: 'd',
    progressLabel: 'Progress',
    colorLabel: 'Color',
    groupParentLabel: 'Belongs to Group',
    noParentGroup: 'No group (Root)',
    assigneeLabel: 'Student / Assignee',
    selectAssigneePlaceholder: 'Choose existing member...',
    newAssigneePrompt: '+ New member',
    unassigned: 'Unassigned',
    quickTeamMembers: 'Team members:',
    teamMembersTitle: 'Team & Assignees',
    teamMembersDesc: 'Define team members once to assign them with a single click across the entire project.',
    manageTeamButton: 'Team',
    notesLabel: 'Deliverables & Notes',
    saveItem: 'Save Item',
    cancel: 'Cancel',
    deleteItem: 'Delete',
    confirmDelete: 'Are you sure you want to delete this item?',

    exportModalTitle: 'Export for Presentation',
    exportModalDesc: 'Formats formatted for defense slides, presentation decks, or written reports.',
    exportPngTitle: 'High-Resolution Image (PNG)',
    exportPngDesc: 'Produces a crisp image ready to paste into PowerPoint, Google Slides, or Canva.',
    downloadPngButton: 'Download PNG Image',
    exportPdfTitle: 'Slide Format / Print (PDF)',
    exportPdfDesc: 'Formatted for widescreen slide projection or clean landscape PDF printout.',
    printPdfButton: 'Print / Save as PDF',
    exportJsonTitle: 'Project Backup (JSON)',
    exportJsonDesc: 'Download the raw project file to back up or share offline with teammates.',
    downloadJsonButton: 'Download .json file',
    importJsonTitle: 'Import JSON Project',
    importJsonDesc: 'Upload a previously saved project file.',
    uploadJsonButton: 'Upload .json file',
    presentationSlideTip: 'Tip: You can also use "Presentation Mode" for a distraction-free fullscreen view during your oral presentation.',
    exporting: 'Generating export...',

    statsTasks: 'Tasks',
    statsGroups: 'Groups',
    statsMilestones: 'Milestones',
    statsCompletion: 'Overall Progress',
    timeframe: 'Project Span',
    weekend: 'Weekend',

    collabBadge: 'EXPERIMENTAL FEATURE',
    collabModalTitle: 'Live Collaboration (P2P)',
    collabModalSubtitle: 'Instant multi-user real-time synchronization on the same Gantt',
    collabStatusConnected: 'Connected live · Real-time channel active',
    collabStatusConnecting: 'Connecting to peer network...',
    collabStatusOffline: 'Offline · Local backup preserved',
    collabPrivateBadge: '100% Private',
    collabShareSectionTitle: 'Share this project with teammates',
    collabShareSectionDesc: 'Anyone opening this link or entering this code will automatically join your live session. Changes sync in real time!',
    collabCodeLabel: 'Code:',
    collabCopyCode: 'Copy Code',
    collabCopyLink: 'Copy',
    collabCopied: 'Copied!',
    collabProfileTitle: 'My Collaborator Identity',
    collabProfileSaved: 'Saved',
    collabNamePlaceholder: 'Your name or nickname (e.g. Alex)',
    collabValidate: 'Save',
    collabAvatarColor: 'Avatar color:',
    collabActiveUsersTitle: 'Teammates on this project',
    collabLive: 'Live',
    collabOnline: 'Online',
    collabYouBadge: 'You',
    collabFirstUser: 'You are the first in this project. Share the link to invite teammates!',
    collabRecentSync: 'Recent synchronized actions',
    collabFooterTip: 'Changes broadcast continuously',
    collabHeaderButton: 'Collaborate',
    collabHeaderLive: 'live',
    collabHeaderTooltip: 'Live collaboration (P2P multi-user)',
    collabUserJoined: 'joined the session',
    collabUserLeft: 'left the session',
    collabUpdatedGantt: 'updated the Gantt chart',
    close: 'Close',

    filterLabel: 'Filters:',
    searchTasksPlaceholder: 'Search tasks...',
    allMembers: 'All members',
    unassigned: 'Unassigned',
    lateFilter: 'Overdue',
    lateFilterTooltip: 'Show only overdue tasks whose deadline has passed',
    milestonesFilter: 'Milestones',
    milestonesFilterTooltip: 'Show only key milestones',
    filterAll: 'All',
    filterTodo: 'To Do',
    filterInProgress: 'In Progress',
    filterDone: 'Done',
    filterTodoTooltip: 'Tasks at 0%',
    filterInProgressTooltip: 'Tasks between 1% and 99%',
    filterDoneTooltip: 'Tasks completed at 100%',
    resetFilters: 'Clear',
    resetFiltersTooltip: 'Reset all filters',
    filterToggleShow: 'Show filter bar',
    filterToggleHide: 'Hide filter bar',

    dragToLinkDotTooltip: 'Direct link (Drag-to-link): click and drag this white dot to another task to create a dependency',
    dragToLinkReleaseTarget: 'Release to link to',
    dragToLinkConnecting: 'Linking: drag towards a dependent task...',
    dragToLinkConnectTo: 'Link to:',
    dragResizeDurationTooltip: 'Drag to extend or shorten duration (days)',
    dragResizeStartTooltip: 'Drag to adjust start date',
    dragMoveUp: '↑ Move Up',
    dragMoveDown: '↓ Move Down',

    workloadButton: 'Workload',
    workloadTooltip: 'Manage team workload distribution',
    presentationButtonTooltip: 'Fullscreen Presentation Mode (Key P)',
    exportButtonTooltip: 'Export project (PDF, PNG, JSON - Key E)',
    shortcutsTooltip: 'Keyboard shortcuts (Key ?)',
    notificationsTooltip: 'Milestone reminders & deadline notifications',
    readOnlyBadge: 'Read-only',
    readOnlyTooltip: 'View-only mode (Read-only)',
    centerTodayTooltip: 'Center view on today',
    undoTooltip: 'Undo (Ctrl+Z)',
    redoTooltip: 'Redo (Ctrl+Y)',
    themeLight: 'Light theme (White)',
    themeDark: 'Dark theme',
    toggleThemeTooltip: 'Toggle between dark and white theme',

    exportOnePagerTitle: 'Executive One-Pager for Jury (PDF)',
    exportOnePagerDesc: 'Executive summary in A4 portrait format: key metrics, milestone table, phase breakdown, and team workload. Perfect for thesis defense or final jury review.',
    exportOnePagerBadge: 'Defense Special',
    exportOnePagerButton: 'Generate One-Pager',
    exportOnePagerSuccess: 'Downloaded!',
    exportIcsTitle: 'Calendar Export (.ics)',
    exportIcsDesc: 'Sync your tasks and milestones into Google Calendar, Apple Calendar, or Outlook with automatic reminders.',
    exportIcsButton: 'Download .ics',
    exportIcsSuccess: 'Calendar ready!',
    exportPdfLandscapeTitle: 'Gantt Schedule PDF (A4 / A3 Landscape)',
    exportPdfLandscapeDesc: 'Generates the full vector diagram ready for large format printing or poster submission.',
    exportPdfLandscapeA4: 'PDF A4',
    exportPdfLandscapeA3: 'PDF A3',
    exportPdfA4Success: 'PDF A4 ready!',
    exportPdfA3Success: 'PDF A3 ready!',
    exportPdfA4Tooltip: 'Download in A4 Landscape format',
    exportPdfA3Tooltip: 'Download in large A3 Landscape format',
    exportScaleLabel: 'PNG time scale:',
    launchPresentationMode: 'Launch Mode',
    presentationModeCardDesc: 'Clean widescreen presentation view tailored for projecting the Gantt in front of your jury or class.',

    // Multi-views
    viewGantt: 'Gantt',
    viewKanban: 'Kanban',
    viewList: 'List',
    viewCalendar: 'Calendar',
    viewSwitcherTooltip: 'Switch view (Gantt, Kanban, List, Calendar)',

    // Kanban
    kanbanTodo: 'To Do',
    kanbanInProgress: 'In Progress',
    kanbanReview: 'Under Review',
    kanbanDone: 'Completed',
    kanbanAddTask: 'Add task',
    kanbanNoTasks: 'No tasks in this column',
    kanbanDropHere: 'Drop here',

    // List View
    listColName: 'Task / Milestone Name',
    listColType: 'Type',
    listColDates: 'Dates',
    listColDuration: 'Duration',
    listColProgress: 'Progress',
    listColAssignee: 'Assignee',
    listColMode: 'Mode',
    listColStatus: 'Status',
    listColActions: 'Actions',
    listQuickAdd: 'Add item',
    listTotalTasks: 'task(s)',

    // Calendar View
    calendarToday: 'Today',
    calendarMonth: 'Month',
    calendarPrevMonth: 'Previous month',
    calendarNextMonth: 'Next month',
    calendarAddTaskAtDate: 'Create task on this date',
    calendarNoTasksThisDay: 'No tasks planned for this day',

    // Comments Notification
    commentsModalTitle: 'Project Comments',
    commentsModalSubtitle: 'Discussion thread and notes on project tasks',
    commentsCount: 'comment(s)',
    commentsEmpty: 'No comments yet',
    commentsEmptyDesc: 'Comments added to tasks will appear here in chronological order.',
    commentsOpenTask: 'Open task',
    commentsSearchPlaceholder: 'Search comment, author, or task...',
  },
};
