import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'fr' | 'en'

export const LABELS: Record<Lang, Record<string, string>> = {
  fr: {
    // Toolbar
    open: 'Ouvrir',
    file: 'Fichier',
    run: 'Lancer',
    stop: 'Arrêter',
    building: 'Compilation...',
    mentor: 'Mentor',
    review: 'Revue',
    challenge: 'Défi',
    duck: 'Duck',
    hideAi: 'Cacher IA',
    showAi: 'Afficher IA',

    // AiPanel
    aiAssistant: 'Assistant IA',
    tabMentor: 'Mentor',
    tabTutor: 'Tuteur',
    tabReview: 'Revue',
    tabChallenge: 'Défi',
    tabDuck: 'Duck',
    tabInterview: 'Entretien',

    // AiChat
    clearChat: 'Effacer',
    chooseModel: 'Choisir un modèle',
    checkingModels: 'Vérification des modèles…',
    testingModels: 'Test des modèles en cours…',
    chatPlaceholder: 'Demandez à votre mentor Java...',
    contextAware: 'Contextuel : l\'IA voit votre fichier',
    mentorTitle: 'Java AI Mentor',
    mentorDesc1: 'Posez-moi n\'importe quelle question Java.',
    mentorDesc2: 'Je vois votre code et adapte',
    mentorDesc3: 'mes explications à votre niveau.',

    // ChallengeMode
    challengeTitle: 'Mode Défi',
    challengeDesc: 'L\'IA génère un défi Java adapté à votre niveau. Résolvez-le dans l\'éditeur puis soumettez.',
    topicLabel: 'Sujet :',
    generateChallenge: 'Générer un défi',
    generatingChallenge: 'Génération du défi...',
    requirements: 'EXIGENCES',
    examples: 'EXEMPLES',
    revealHint: 'Afficher un indice',
    submitSolution: 'Soumettre ma solution',
    evaluating: 'Évaluation en cours...',
    evalResults: 'Résultats de l\'évaluation',
    newChallenge: 'Nouveau défi',

    // CodeReviewer
    reviewTitle: 'Revue de Code',
    reviewDesc: 'Un ingénieur Java senior revoit votre code pour sa correction, ses bonnes pratiques et ses idiomes Java.',
    reviewing: 'Revue en cours...',
    reviewBtn: 'Revoir mon code',

    // CodeTutor
    tutorTitle: 'Tuteur de Code',
    tutorDesc: 'Obtenez une explication étape par étape de votre code avec analogies et raisonnement clair.',
    explaining: 'Explication en cours...',
    explainBtn: 'Expliquer ce code',
    noContent: 'Aucun contenu à expliquer.',

    // InterviewPrep
    interviewTitle: 'Préparation Entretien',
    interviewDesc: 'Entretien technique Java simulé. L\'IA donne un retour réel et note vos réponses.',
    levelLabel: 'NIVEAU',
    topicsLabel: 'SUJETS',
    startInterview: 'Commencer l\'entretien',
    endSession: 'Terminer la session',
    yourAnswer: 'VOTRE RÉPONSE',
    interviewer: 'RECRUTEUR',
    answerPlaceholder: 'Votre réponse... (Entrée pour soumettre)',
    lvlJunior: 'Débutant',
    lvlMid: 'Intermédiaire',
    lvlSenior: 'Senior',

    // RubberDuck
    duckTitle: 'Rubber Duck Debugger',
    duckDesc1: 'Décrivez votre bug. Le duck vous posera',
    duckDesc2: 'des questions pour vous aider à trouver la réponse.',
    duckNote: '(Le duck ne donne jamais la réponse directement)',
    duckAnswerPlaceholder: 'Répondez à la question du duck...',
    duckFoundBug: 'J\'ai trouvé le bug ! Terminer',
    duckDescPlaceholder: 'Décrivez votre bug... ex: \'Ma boucle tourne une fois de trop et je ne sais pas pourquoi\'',
    duckTalkBtn: 'Parler au Duck',
    duckYou: 'VOUS',
    duckLabel: 'DUCK',

    // StatusBar
    compiling: 'Compilation...',
    running: 'En cours',
    errors: 'erreur(s)',
    aiThinking: 'IA en réflexion...',
    dailyKata: 'Kata du Jour',
    dayStreak: 'j. de suite',
    conceptsMastered: 'concepts maîtrisés',

    // FileExplorer
    openProject: 'Ouvrir un projet pour parcourir les fichiers',
    newJavaFile: 'Nouveau fichier Java',
    newFolder: 'Nouveau dossier',
    refresh: 'Actualiser',
    newJavaFileHere: 'Nouveau fichier Java ici',
    newFolderHere: 'Nouveau dossier ici',

    // LearningNav
    overallProgress: 'Progression globale',
    concepts: 'concepts',

    // EditorPane
    openProjectWith: 'Ouvrir un projet avec',
    orOpenFileWith: 'Ou ouvrir un fichier avec',
    askMentor: 'Demander au mentor IA avec',
  },
  en: {
    // Toolbar
    open: 'Open',
    file: 'File',
    run: 'Run',
    stop: 'Stop',
    building: 'Building...',
    mentor: 'Mentor',
    review: 'Review',
    challenge: 'Challenge',
    duck: 'Duck',
    hideAi: 'Hide AI',
    showAi: 'Show AI',

    // AiPanel
    aiAssistant: 'AI Assistant',
    tabMentor: 'Mentor',
    tabTutor: 'Tutor',
    tabReview: 'Review',
    tabChallenge: 'Challenge',
    tabDuck: 'Duck',
    tabInterview: 'Interview',

    // AiChat
    clearChat: 'Clear chat',
    chooseModel: 'Choose a model',
    checkingModels: 'Checking models…',
    testingModels: 'Testing models…',
    chatPlaceholder: 'Ask your Java mentor...',
    contextAware: 'Context-aware: AI sees your current file',
    mentorTitle: 'Java AI Mentor',
    mentorDesc1: 'Ask me anything about Java.',
    mentorDesc2: 'I can see your current code and',
    mentorDesc3: 'adapt explanations to your level.',

    // ChallengeMode
    challengeTitle: 'Challenge Mode',
    challengeDesc: 'AI generates a Java challenge adapted to your level. Solve it in the editor, then submit for evaluation.',
    topicLabel: 'Topic:',
    generateChallenge: 'Generate Challenge',
    generatingChallenge: 'Generating your challenge...',
    requirements: 'REQUIREMENTS',
    examples: 'EXAMPLES',
    revealHint: 'Reveal hint',
    submitSolution: 'Submit Solution',
    evaluating: 'Evaluating your solution...',
    evalResults: 'Evaluation Results',
    newChallenge: 'New Challenge',

    // CodeReviewer
    reviewTitle: 'Code Review',
    reviewDesc: 'Senior Java engineer reviews your code for correctness, best practices, and Java idioms.',
    reviewing: 'Reviewing...',
    reviewBtn: 'Review My Code',

    // CodeTutor
    tutorTitle: 'Code Tutor',
    tutorDesc: 'Get a step-by-step explanation of your current code with analogies and clear reasoning.',
    explaining: 'Explaining...',
    explainBtn: 'Explain This Code',
    noContent: 'No content to explain.',

    // InterviewPrep
    interviewTitle: 'Interview Prep',
    interviewDesc: 'Mock Java technical interview. AI provides real feedback and scores your answers.',
    levelLabel: 'LEVEL',
    topicsLabel: 'TOPICS',
    startInterview: 'Start Interview',
    endSession: 'End Session',
    yourAnswer: 'YOUR ANSWER',
    interviewer: 'INTERVIEWER',
    answerPlaceholder: 'Your answer... (Enter to submit)',
    lvlJunior: 'Junior',
    lvlMid: 'Mid',
    lvlSenior: 'Senior',

    // RubberDuck
    duckTitle: 'Rubber Duck Debugger',
    duckDesc1: 'Describe your bug. The duck will ask you',
    duckDesc2: 'questions to help YOU find the answer.',
    duckNote: '(The duck never gives the answer directly)',
    duckAnswerPlaceholder: 'Answer the duck\'s question...',
    duckFoundBug: 'I found the bug! End session',
    duckDescPlaceholder: 'Describe your bug... e.g. \'My loop runs one too many times and I can\'t figure out why\'',
    duckTalkBtn: 'Talk to the Duck',
    duckYou: 'YOU',
    duckLabel: 'DUCK',

    // StatusBar
    compiling: 'Compiling...',
    running: 'Running',
    errors: 'error(s)',
    aiThinking: 'AI thinking...',
    dailyKata: 'Daily Kata',
    dayStreak: 'day streak',
    conceptsMastered: 'concepts mastered',

    // FileExplorer
    openProject: 'Open a project to browse files',
    newJavaFile: 'New Java File',
    newFolder: 'New Folder',
    refresh: 'Refresh',
    newJavaFileHere: 'New Java File here',
    newFolderHere: 'New Folder here',

    // LearningNav
    overallProgress: 'Overall Progress',
    concepts: 'concepts',

    // EditorPane
    openProjectWith: 'Open a project with',
    orOpenFileWith: 'Or open a file with',
    askMentor: 'Ask the AI mentor anything with',
  },
}

interface LangStore {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

export const useLangStore = create<LangStore>()(
  persist(
    (set, get) => ({
      lang: 'fr',
      setLang: (l) => set({ lang: l }),
      t: (key) => LABELS[get().lang][key] ?? key,
    }),
    { name: 'javamind:lang' }
  )
)
