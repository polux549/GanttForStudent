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
}

export const WINDOWS_DOWNLOAD_URL = 'https://drive.google.com/drive/folders/1h-tax4uyVsjDnlloWBBMxj1rTsm6AcDx?usp=sharing';

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
    projectCodePlaceholder: 'Ex: STU-2026',
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
    projectCodePlaceholder: 'Z.B.: STU-2026',
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
    projectCodePlaceholder: 'Es: STU-2026',
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
    projectCodePlaceholder: 'E.g.: STU-2026',
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
  },
};
