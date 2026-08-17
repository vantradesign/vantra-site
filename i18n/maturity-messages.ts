import type { Locale } from '@vantra-design/maturity-core'

type MessageKey =
  | 'introQuestionCount'
  | 'introStart'
  | 'introContinue'
  | 'stepOf'
  | 'stepSkipNote'
  | 'stepBack'
  | 'stepNext'
  | 'stepSeeResult'
  | 'stepSkipToResult'
  | 'stepAnswered'
  | 'questionNumber'
  | 'questionAddNote'
  | 'questionEditNote'
  | 'questionHideNote'
  | 'questionNoteLabel'
  | 'questionSources'
  | 'progressLabel'
  | 'resultLoading'
  | 'resultEmptyTitle'
  | 'resultEmptyBody'
  | 'resultAnsweredCount'
  | 'resultLevelHeading'
  | 'resultPartial'
  | 'resultNextTitle'
  | 'resultNextLead'
  | 'resultStartHere'
  | 'resultExportTitle'
  | 'resultExportLead'
  | 'resultDownloadMarkdown'
  | 'resultDownloadJson'
  | 'resultCopyLink'
  | 'resultLinkCopied'
  | 'resultCopyFailed'
  | 'resultShareNote'
  | 'resultCaveatTitle'
  | 'resultCaveatBody'
  | 'resultDelete'
  | 'resultDeleteConfirmQuestion'
  | 'resultDeleteExportFirst'
  | 'resultDeleteCancel'
  | 'resultDeleteConfirmYes'
  | 'resultDeleted'
  | 'resultDroppedOne'
  | 'resultDropped'
  | 'sharedViewTitle'
  | 'sharedViewBody'
  | 'sharedViewSeeMine'
  | 'sharedViewStartOwn'
  | 'effortS'
  | 'effortM'
  | 'effortL'
  | 'tableCaption'
  | 'tableDimension'
  | 'tableScore'
  | 'tableLevel'
  | 'tableNotAnswered'
  | 'tableAnsweredOf'
  | 'language'
  | 'footerPrivacy'
  | 'footerCatalog'
  | 'footerMethodology'
  | 'footerSource'

const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    introQuestionCount: '{count} questions · about 10 minutes',
    introStart: 'Start the check',
    introContinue: 'Continue where you left off',

    stepOf: 'Step {number} of {total}',
    stepSkipNote: 'Skip any question you cannot answer yet — it will not count against you.',
    stepBack: 'Back',
    stepNext: 'Next category',
    stepSeeResult: 'See result',
    stepSkipToResult: 'Skip to result',
    stepAnswered: '{answered} of {total}',

    questionNumber: 'Question {number}',
    questionAddNote: 'Add a note',
    questionEditNote: 'Edit note',
    questionHideNote: 'Hide note',
    questionNoteLabel: 'Your note (not scored)',
    questionSources: 'Where this comes from',

    progressLabel: 'Assessment progress',

    resultLoading: 'Loading your result…',
    resultEmptyTitle: 'Nothing here yet.',
    resultEmptyBody: 'Answer at least one question and come back.',
    resultAnsweredCount: '{answered} of {total} questions answered',
    resultLevelHeading: 'Level {level} — {name}',
    resultPartial: 'Some questions are unanswered. The score reflects only what was answered.',
    resultNextTitle: 'What to do next',
    resultNextLead:
      'Concrete steps for where you are now, sorted by dimension. The ones marked "{marker}" are the dimensions that need the most attention.',
    resultStartHere: 'Start here',
    resultExportTitle: 'Export and share',
    resultExportLead:
      'Download the full result, or copy a link that lets someone else see this exact snapshot.',
    resultDownloadMarkdown: 'Download Markdown',
    resultDownloadJson: 'Download JSON',
    resultCopyLink: 'Copy share link',
    resultLinkCopied: 'Link copied. It encodes the answers, not a session — anyone with it sees the same result.',
    resultCopyFailed:
      'Could not copy. Your browser may not allow clipboard access on this page. You can copy the URL from the address bar instead.',
    resultShareNote:
      'The link contains only the answers, encoded in the URL fragment. Nothing is sent to any server.',
    resultCaveatTitle: 'How to read this',
    resultCaveatBody:
      'This is a self-assessment, not an audit. The score reflects what you reported, not what an external review would find. Use it as a starting point for conversation, not as a certificate.',
    resultDelete: 'Delete all my answers',
    resultDeleteConfirmQuestion: 'This will delete all 24 answers from this browser. There is no undo.',
    resultDeleteExportFirst: 'If you want to keep them, download the Markdown or JSON first.',
    resultDeleteCancel: 'Keep my answers',
    resultDeleteConfirmYes: 'Delete everything',
    resultDeleted: 'Answers deleted.',
    resultDroppedOne: '1 answer from the shared link refers to a question that no longer exists and was not counted.',
    resultDropped: '{count} answers from the shared link refer to questions that no longer exist and were not counted.',

    sharedViewTitle: 'You are viewing a shared result.',
    sharedViewBody:
      "These are someone else's answers, opened from a link. Your own answers, if any, are still saved in this browser.",
    sharedViewSeeMine: 'See my own result',
    sharedViewStartOwn: 'Start my own check',

    effortS: 'Effort: days',
    effortM: 'Effort: weeks',
    effortL: 'Effort: a quarter',

    tableCaption: 'Score by dimension',
    tableDimension: 'Dimension',
    tableScore: 'Score',
    tableLevel: 'Level',
    tableNotAnswered: 'Not answered',
    tableAnsweredOf: '{answered} of {total}',

    language: 'Language',
    footerPrivacy: 'Nothing leaves the browser.',
    footerCatalog: 'Catalog v{version}',
    footerMethodology: 'Methodology',
    footerSource: 'Source',
  },
  de: {
    introQuestionCount: '{count} Fragen · ca. 10 Minuten',
    introStart: 'Check starten',
    introContinue: 'Dort weitermachen, wo Sie aufgehört haben',

    stepOf: 'Schritt {number} von {total}',
    stepSkipNote: 'Überspringen Sie Fragen, die Sie noch nicht beantworten können — sie zählen nicht gegen Sie.',
    stepBack: 'Zurück',
    stepNext: 'Nächste Kategorie',
    stepSeeResult: 'Ergebnis ansehen',
    stepSkipToResult: 'Zum Ergebnis springen',
    stepAnswered: '{answered} von {total}',

    questionNumber: 'Frage {number}',
    questionAddNote: 'Notiz hinzufügen',
    questionEditNote: 'Notiz bearbeiten',
    questionHideNote: 'Notiz ausblenden',
    questionNoteLabel: 'Ihre Notiz (wird nicht bewertet)',
    questionSources: 'Woher das kommt',

    progressLabel: 'Fortschritt der Bewertung',

    resultLoading: 'Ihr Ergebnis wird geladen…',
    resultEmptyTitle: 'Noch nichts hier.',
    resultEmptyBody: 'Beantworten Sie mindestens eine Frage und kommen Sie zurück.',
    resultAnsweredCount: '{answered} von {total} Fragen beantwortet',
    resultLevelHeading: 'Stufe {level} — {name}',
    resultPartial: 'Einige Fragen sind unbeantwortet. Die Bewertung berücksichtigt nur, was beantwortet wurde.',
    resultNextTitle: 'Was als Nächstes zu tun ist',
    resultNextLead:
      'Konkrete Schritte für Ihre aktuelle Situation, nach Dimension sortiert. Die mit „{marker}" markierten Dimensionen brauchen die meiste Aufmerksamkeit.',
    resultStartHere: 'Hier anfangen',
    resultExportTitle: 'Exportieren und teilen',
    resultExportLead:
      'Laden Sie das vollständige Ergebnis herunter, oder kopieren Sie einen Link, über den jemand anderes genau diesen Snapshot sehen kann.',
    resultDownloadMarkdown: 'Markdown herunterladen',
    resultDownloadJson: 'JSON herunterladen',
    resultCopyLink: 'Link kopieren',
    resultLinkCopied: 'Link kopiert. Er kodiert die Antworten, keine Sitzung — jeder mit dem Link sieht dasselbe Ergebnis.',
    resultCopyFailed:
      'Konnte nicht kopiert werden. Ihr Browser erlaubt möglicherweise keinen Zwischenablagenzugriff auf dieser Seite. Sie können die URL stattdessen aus der Adressleiste kopieren.',
    resultShareNote:
      'Der Link enthält nur die Antworten, kodiert im URL-Fragment. Nichts wird an einen Server gesendet.',
    resultCaveatTitle: 'Wie Sie das lesen sollten',
    resultCaveatBody:
      'Dies ist eine Selbstbewertung, kein Audit. Die Bewertung spiegelt wider, was Sie berichtet haben, nicht was eine externe Prüfung finden würde. Nutzen Sie sie als Ausgangspunkt für Gespräche, nicht als Zertifikat.',
    resultDelete: 'Alle Antworten löschen',
    resultDeleteConfirmQuestion: 'Dies löscht alle 24 Antworten aus diesem Browser. Es gibt kein Rückgängigmachen.',
    resultDeleteExportFirst: 'Wenn Sie sie behalten möchten, laden Sie zuerst das Markdown oder JSON herunter.',
    resultDeleteCancel: 'Antworten behalten',
    resultDeleteConfirmYes: 'Alles löschen',
    resultDeleted: 'Antworten gelöscht.',
    resultDroppedOne: '1 Antwort aus dem geteilten Link bezieht sich auf eine Frage, die nicht mehr existiert, und wurde nicht gezählt.',
    resultDropped: '{count} Antworten aus dem geteilten Link beziehen sich auf Fragen, die nicht mehr existieren, und wurden nicht gezählt.',

    sharedViewTitle: 'Sie sehen ein geteiltes Ergebnis.',
    sharedViewBody:
      'Dies sind die Antworten einer anderen Person, geöffnet über einen Link. Ihre eigenen Antworten, falls vorhanden, sind weiterhin in diesem Browser gespeichert.',
    sharedViewSeeMine: 'Mein eigenes Ergebnis',
    sharedViewStartOwn: 'Eigenen Check starten',

    effortS: 'Aufwand: Tage',
    effortM: 'Aufwand: Wochen',
    effortL: 'Aufwand: ein Quartal',

    tableCaption: 'Bewertung nach Dimension',
    tableDimension: 'Dimension',
    tableScore: 'Bewertung',
    tableLevel: 'Stufe',
    tableNotAnswered: 'Nicht beantwortet',
    tableAnsweredOf: '{answered} von {total}',

    language: 'Sprache',
    footerPrivacy: 'Nichts verlässt den Browser.',
    footerCatalog: 'Katalog v{version}',
    footerMethodology: 'Methodik',
    footerSource: 'Quellcode',
  },
}

export type { MessageKey }
export { messages }
