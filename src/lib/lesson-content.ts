// Pre-written lesson content for every curriculum concept (FR + EN)

export interface LessonSection {
  type: 'intro' | 'concept' | 'code' | 'tip' | 'keypoints'
  title?: string
  text?: string
  code?: string
  points?: string[]
}

export interface LessonData {
  titleFr: string
  titleEn: string
  descFr: string
  descEn: string
  sections: {
    fr: LessonSection[]
    en: LessonSection[]
  }
  challengeBoilerplateFr: string
  challengeBoilerplateEn: string
}

const LESSONS: Record<string, LessonData> = {

  // ── JAVA FUNDAMENTALS ─────────────────────────────────────────

  setup: {
    titleFr: 'Hello World & Configuration',
    titleEn: 'Hello World & Setup',
    descFr: 'Votre premier programme Java et comprendre la JVM',
    descEn: 'Your first Java program and understanding the JVM',
    sections: {
      fr: [
        { type: 'intro', text: "Java est un langage compilé qui s'exécute sur la JVM (Java Virtual Machine). Votre code source (.java) est d'abord compilé en bytecode (.class), puis la JVM l'exécute sur n'importe quel système. C'est ce qu'on appelle \"Write Once, Run Anywhere\"." },
        { type: 'concept', title: 'Structure d\'un programme Java', text: 'Chaque programme Java doit avoir au minimum une classe et une méthode main. La classe doit avoir le même nom que le fichier.' },
        { type: 'code', title: 'Votre premier programme', code: `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Bonjour, Java !");\n        System.out.println("La JVM tourne !");\n    }\n}` },
        { type: 'tip', text: "System.out.println() affiche du texte et passe à la ligne. System.out.print() affiche sans sauter de ligne." },
        { type: 'keypoints', points: ['Le nom de la classe doit correspondre exactement au nom du fichier .java', 'La méthode main est le point d\'entrée obligatoire : public static void main(String[] args)', 'Java est sensible à la casse : HelloWorld ≠ helloworld', 'Chaque instruction se termine par un point-virgule ;'] },
      ],
      en: [
        { type: 'intro', text: "Java is a compiled language that runs on the JVM (Java Virtual Machine). Your source code (.java) is compiled into bytecode (.class), which the JVM runs on any system — that's \"Write Once, Run Anywhere\"." },
        { type: 'concept', title: 'Java Program Structure', text: 'Every Java program needs at least one class with a main method. The class name must match the filename.' },
        { type: 'code', title: 'Your first program', code: `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n        System.out.println("JVM is running!");\n    }\n}` },
        { type: 'tip', text: "System.out.println() prints text and moves to a new line. System.out.print() prints without the newline." },
        { type: 'keypoints', points: ['Class name must exactly match the .java filename', 'The main method is the mandatory entry point: public static void main(String[] args)', 'Java is case-sensitive: HelloWorld ≠ helloworld', 'Every statement ends with a semicolon ;'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Hello World & Configuration
// Objectif : créez un programme qui vous présente.

public class Challenge {
    public static void main(String[] args) {
        // TODO : Affichez votre prénom, votre langage préféré
        // et un message de bienvenue sur 3 lignes séparées.

    }
}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Hello World & Setup
// Goal: create a program that introduces you.

public class Challenge {
    public static void main(String[] args) {
        // TODO: Print your name, your favorite language,
        // and a welcome message on 3 separate lines.

    }
}`,
  },

  variables: {
    titleFr: 'Variables & Types de données',
    titleEn: 'Variables & Data Types',
    descFr: 'int, String, boolean, double et les autres types fondamentaux',
    descEn: 'int, String, boolean, double and the fundamental types',
    sections: {
      fr: [
        { type: 'intro', text: "Une variable est une boîte nommée qui stocke une valeur. En Java, chaque variable a un type défini à la compilation. Il existe 8 types primitifs et un type référence incontournable : String." },
        { type: 'concept', title: 'Types primitifs essentiels', text: '• int — entier (-2 milliards à +2 milliards)\n• double — nombre décimal (3.14, -0.5)\n• boolean — vrai ou faux (true / false)\n• char — un seul caractère (\'A\', \'z\', \'3\')\n• long — grand entier (avec L à la fin : 10_000_000_000L)' },
        { type: 'code', title: 'Déclarations de variables', code: `public class Variables {\n    public static void main(String[] args) {\n        int age = 25;\n        double temperature = 36.6;\n        boolean estConnecte = true;\n        char initiale = 'J';\n        String prenom = "Alice";  // String = majuscule!\n\n        // Affichage\n        System.out.println("Âge : " + age);\n        System.out.println("Prénom : " + prenom);\n        System.out.println("Connecté : " + estConnecte);\n    }\n}` },
        { type: 'tip', text: "var (Java 10+) permet l'inférence de type : var age = 25; — Java devine que c'est un int. Pratique mais à ne pas abuser." },
        { type: 'keypoints', points: ['Java est statiquement typé : le type est fixé à la déclaration', 'String commence par une majuscule (c\'est une classe, pas un primitif)', 'Convention de nommage : camelCase (monNombre, estActif)', 'Une variable doit être initialisée avant d\'être utilisée'] },
      ],
      en: [
        { type: 'intro', text: "A variable is a named box that stores a value. In Java, every variable has a fixed type determined at compile time. There are 8 primitive types and one essential reference type: String." },
        { type: 'concept', title: 'Key primitive types', text: '• int — integer (-2 billion to +2 billion)\n• double — decimal number (3.14, -0.5)\n• boolean — true or false\n• char — single character (\'A\', \'z\', \'3\')\n• long — large integer (with L suffix: 10_000_000_000L)' },
        { type: 'code', title: 'Variable declarations', code: `public class Variables {\n    public static void main(String[] args) {\n        int age = 25;\n        double temperature = 36.6;\n        boolean isConnected = true;\n        char initial = 'J';\n        String name = "Alice";  // String = capital S!\n\n        System.out.println("Age: " + age);\n        System.out.println("Name: " + name);\n        System.out.println("Connected: " + isConnected);\n    }\n}` },
        { type: 'tip', text: "var (Java 10+) allows type inference: var age = 25; — Java figures out it's an int. Handy, but don't overuse it." },
        { type: 'keypoints', points: ['Java is statically typed: the type is fixed at declaration', 'String starts with a capital letter (it\'s a class, not a primitive)', 'Naming convention: camelCase (myNumber, isActive)', 'A variable must be initialized before use'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Variables & Types de données

public class Challenge {
    public static void main(String[] args) {
        // TODO : Déclarez des variables pour décrire un produit :
        // nom (String), prix (double), quantité (int), enStock (boolean)
        // Puis affichez une fiche produit formatée.

    }
}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Variables & Data Types

public class Challenge {
    public static void main(String[] args) {
        // TODO: Declare variables to describe a product:
        // name (String), price (double), quantity (int), inStock (boolean)
        // Then print a formatted product sheet.

    }
}`,
  },

  operators: {
    titleFr: 'Opérateurs & Expressions',
    titleEn: 'Operators & Expressions',
    descFr: 'Opérateurs arithmétiques, de comparaison et logiques',
    descEn: 'Arithmetic, comparison, and logical operators',
    sections: {
      fr: [
        { type: 'intro', text: "Les opérateurs vous permettent de calculer, comparer et combiner des valeurs. Ils sont au cœur de toute logique de programme." },
        { type: 'concept', title: 'Opérateurs arithmétiques', text: '+ addition, - soustraction, * multiplication, / division, % modulo (reste)\n⚠️ Division entière : 7 / 2 = 3 (pas 3.5 !)\nPour avoir 3.5 : 7.0 / 2 ou (double)7 / 2' },
        { type: 'code', title: 'Exemples', code: `int a = 10, b = 3;\nSystem.out.println(a + b);  // 13\nSystem.out.println(a - b);  // 7\nSystem.out.println(a * b);  // 30\nSystem.out.println(a / b);  // 3  (entier!)\nSystem.out.println(a % b);  // 1  (reste)\n\n// Comparaisons → boolean\nboolean egal = (a == b);    // false\nboolean plusGrand = a > b;  // true\n\n// Logique\nboolean resultat = (a > 5) && (b < 10);  // true\nboolean negation = !egal;               // true` },
        { type: 'tip', text: "L'opérateur % (modulo) est très utile : x % 2 == 0 teste si x est pair. x % 10 donne le dernier chiffre de x." },
        { type: 'keypoints', points: ['7 / 2 = 3 en Java (division entière), pas 3.5', 'Utilisez == pour comparer les primitifs, .equals() pour les String', '&& et || sont en court-circuit : si le résultat est déjà connu, le reste n\'est pas évalué', 'a++ équivaut à a = a + 1'] },
      ],
      en: [
        { type: 'intro', text: "Operators let you calculate, compare, and combine values. They are at the core of every program's logic." },
        { type: 'concept', title: 'Arithmetic operators', text: '+ add, - subtract, * multiply, / divide, % modulo (remainder)\n⚠️ Integer division: 7 / 2 = 3 (not 3.5!)\nFor 3.5: use 7.0 / 2 or (double)7 / 2' },
        { type: 'code', title: 'Examples', code: `int a = 10, b = 3;\nSystem.out.println(a + b);  // 13\nSystem.out.println(a / b);  // 3  (integer!)\nSystem.out.println(a % b);  // 1  (remainder)\n\n// Comparisons → boolean\nboolean equal = (a == b);   // false\nboolean bigger = a > b;     // true\n\n// Logic\nboolean result = (a > 5) && (b < 10);  // true\nboolean negation = !equal;             // true` },
        { type: 'tip', text: "The % (modulo) operator is very useful: x % 2 == 0 tests if x is even. x % 10 gives the last digit of x." },
        { type: 'keypoints', points: ['7 / 2 = 3 in Java (integer division), not 3.5', 'Use == for primitives, .equals() for Strings', '&& and || are short-circuit: if result is already known, the rest is not evaluated', 'a++ is equivalent to a = a + 1'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Opérateurs & Expressions

public class Challenge {
    public static void main(String[] args) {
        // TODO : Le défi est dans le panneau IA →

    }
}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Operators & Expressions

public class Challenge {
    public static void main(String[] args) {
        // TODO: The challenge is in the AI panel →

    }
}`,
  },

  'control-flow': {
    titleFr: 'Structures de Contrôle',
    titleEn: 'Control Flow',
    descFr: 'if/else, switch et l\'opérateur ternaire',
    descEn: 'if/else, switch, and the ternary operator',
    sections: {
      fr: [
        { type: 'intro', text: "Les structures de contrôle permettent à votre programme de prendre des décisions. C'est grâce à elles que le code n'est pas simplement une liste d'instructions mais un programme intelligent." },
        { type: 'code', title: 'if / else if / else', code: `int note = 75;\n\nif (note >= 90) {\n    System.out.println("Excellent !");\n} else if (note >= 70) {\n    System.out.println("Bien !");\n} else if (note >= 50) {\n    System.out.println("Passable");\n} else {\n    System.out.println("Insuffisant");\n}` },
        { type: 'code', title: 'switch (Java 14+ : switch expression)', code: `String jour = "LUNDI";\nString type = switch (jour) {\n    case "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI" -> "Jour ouvré";\n    case "SAMEDI", "DIMANCHE" -> "Week-end";\n    default -> "Inconnu";\n};` },
        { type: 'concept', title: 'Opérateur ternaire', text: 'condition ? valeurSiVrai : valeurSiFaux\nEx : String label = (age >= 18) ? "Adulte" : "Mineur";' },
        { type: 'keypoints', points: ['Toujours utiliser des accolades {}, même pour une seule instruction', 'switch est préférable quand on compare une seule variable à plusieurs valeurs constantes', 'Le ternaire est parfait pour assigner une valeur selon une condition simple'] },
      ],
      en: [
        { type: 'intro', text: "Control flow structures let your program make decisions. They're what makes code more than just a list of instructions." },
        { type: 'code', title: 'if / else if / else', code: `int score = 75;\n\nif (score >= 90) {\n    System.out.println("Excellent!");\n} else if (score >= 70) {\n    System.out.println("Good!");\n} else if (score >= 50) {\n    System.out.println("Pass");\n} else {\n    System.out.println("Fail");\n}` },
        { type: 'code', title: 'switch expression (Java 14+)', code: `String day = "MONDAY";\nString type = switch (day) {\n    case "MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY" -> "Weekday";\n    case "SATURDAY", "SUNDAY" -> "Weekend";\n    default -> "Unknown";\n};` },
        { type: 'concept', title: 'Ternary operator', text: 'condition ? valueIfTrue : valueIfFalse\nEx: String label = (age >= 18) ? "Adult" : "Minor";' },
        { type: 'keypoints', points: ['Always use braces {}, even for a single statement', 'switch is preferred when comparing one variable to multiple constant values', 'Ternary is great for assigning a value based on a simple condition'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Structures de Contrôle

public class Challenge {
    public static void main(String[] args) {
        // TODO : Le défi est dans le panneau IA →

    }
}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Control Flow

public class Challenge {
    public static void main(String[] args) {
        // TODO: The challenge is in the AI panel →

    }
}`,
  },

  loops: {
    titleFr: 'Boucles & Itération',
    titleEn: 'Loops & Iteration',
    descFr: 'for, while, do-while et for-each',
    descEn: 'for, while, do-while, for-each',
    sections: {
      fr: [
        { type: 'intro', text: "Les boucles permettent de répéter des instructions. Elles sont indispensables pour traiter des listes, calculer des sommes, ou toute tâche répétitive." },
        { type: 'code', title: 'for classique — quand on connaît le nombre d\'itérations', code: `for (int i = 0; i < 5; i++) {\n    System.out.println("Tour n°" + i);\n}\n// Affiche : Tour n°0, Tour n°1, Tour n°2, Tour n°3, Tour n°4` },
        { type: 'code', title: 'while — tant qu\'une condition est vraie', code: `int compteur = 0;\nwhile (compteur < 3) {\n    System.out.println("Compteur = " + compteur);\n    compteur++;\n}` },
        { type: 'code', title: 'for-each — pour parcourir une collection/tableau', code: `String[] fruits = {"pomme", "banane", "cerise"};\nfor (String fruit : fruits) {\n    System.out.println("J'aime la " + fruit);\n}` },
        { type: 'tip', text: "break sort immédiatement de la boucle. continue passe à l'itération suivante sans exécuter le reste du bloc." },
        { type: 'keypoints', points: ['for si le nombre d\'itérations est connu à l\'avance', 'while si on continue jusqu\'à ce qu\'une condition soit fausse', 'for-each pour parcourir des tableaux/collections (plus lisible)', 'Ne pas oublier d\'incrémenter le compteur dans un while (sinon boucle infinie !)'] },
      ],
      en: [
        { type: 'intro', text: "Loops let you repeat instructions. They're essential for processing lists, computing sums, or any repetitive task." },
        { type: 'code', title: 'for loop — when you know the iteration count', code: `for (int i = 0; i < 5; i++) {\n    System.out.println("Round #" + i);\n}\n// Prints: Round #0, Round #1, Round #2, Round #3, Round #4` },
        { type: 'code', title: 'while — as long as condition is true', code: `int counter = 0;\nwhile (counter < 3) {\n    System.out.println("Counter = " + counter);\n    counter++;\n}` },
        { type: 'code', title: 'for-each — to iterate over collections/arrays', code: `String[] fruits = {"apple", "banana", "cherry"};\nfor (String fruit : fruits) {\n    System.out.println("I like " + fruit);\n}` },
        { type: 'tip', text: "break exits the loop immediately. continue skips the rest of the current iteration and moves to the next." },
        { type: 'keypoints', points: ['for when the number of iterations is known', 'while when continuing until a condition becomes false', 'for-each to iterate over arrays/collections (more readable)', 'Don\'t forget to increment in a while loop (or infinite loop!)'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Boucles & Itération

public class Challenge {
    public static void main(String[] args) {
        // TODO : Le défi est dans le panneau IA →

    }
}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Loops & Iteration

public class Challenge {
    public static void main(String[] args) {
        // TODO: The challenge is in the AI panel →

    }
}`,
  },

  methods: {
    titleFr: 'Méthodes & Fonctions',
    titleEn: 'Methods & Functions',
    descFr: 'Paramètres, types de retour et surcharge de méthodes',
    descEn: 'Parameters, return types, method overloading',
    sections: {
      fr: [
        { type: 'intro', text: "Une méthode est un bloc de code réutilisable avec un nom. Elle applique le principe DRY (Don't Repeat Yourself) : on écrit une fois, on appelle partout." },
        { type: 'code', title: 'Anatomie d\'une méthode', code: `// typeRetour nomMéthode(type param1, type param2)\npublic static int addition(int a, int b) {\n    return a + b;\n}\n\n// Méthode sans retour → void\npublic static void afficherBonjour(String prenom) {\n    System.out.println("Bonjour, " + prenom + " !");\n}\n\n// Appel dans main\npublic static void main(String[] args) {\n    int resultat = addition(3, 7);  // 10\n    afficherBonjour("Alice");\n}` },
        { type: 'concept', title: 'Surcharge (overloading)', text: 'Plusieurs méthodes peuvent avoir le même nom si leurs paramètres diffèrent.' },
        { type: 'code', title: 'Surcharge de méthode', code: `public static double aire(double rayon) {\n    return Math.PI * rayon * rayon;\n}\npublic static double aire(double longueur, double largeur) {\n    return longueur * largeur;\n}\n// Java choisit automatiquement selon les arguments` },
        { type: 'keypoints', points: ['static signifie que la méthode appartient à la classe, pas à une instance', 'void = la méthode ne retourne rien', 'Les paramètres sont des copies (passage par valeur pour les primitifs)', 'Une méthode ne devrait faire qu\'une seule chose (principe de responsabilité unique)'] },
      ],
      en: [
        { type: 'intro', text: "A method is a reusable block of code with a name. It applies the DRY principle (Don't Repeat Yourself): write once, call everywhere." },
        { type: 'code', title: 'Method anatomy', code: `// returnType methodName(type param1, type param2)\npublic static int add(int a, int b) {\n    return a + b;\n}\n\n// No return value → void\npublic static void greet(String name) {\n    System.out.println("Hello, " + name + "!");\n}\n\npublic static void main(String[] args) {\n    int result = add(3, 7);  // 10\n    greet("Alice");\n}` },
        { type: 'concept', title: 'Overloading', text: 'Multiple methods can share the same name if their parameter lists differ.' },
        { type: 'code', title: 'Method overloading', code: `public static double area(double radius) {\n    return Math.PI * radius * radius;\n}\npublic static double area(double length, double width) {\n    return length * width;\n}\n// Java picks automatically based on arguments` },
        { type: 'keypoints', points: ['static means the method belongs to the class, not an instance', 'void = the method returns nothing', 'Parameters are copies (pass-by-value for primitives)', 'A method should do only one thing (single responsibility principle)'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Méthodes & Fonctions

public class Challenge {
    public static void main(String[] args) {
        // TODO : Le défi est dans le panneau IA →

    }

    // Ajoutez vos méthodes ici
}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Methods & Functions

public class Challenge {
    public static void main(String[] args) {
        // TODO: The challenge is in the AI panel →

    }

    // Add your methods here
}`,
  },

  arrays: {
    titleFr: 'Tableaux',
    titleEn: 'Arrays',
    descFr: 'Tableaux à une et plusieurs dimensions',
    descEn: 'Single and multi-dimensional arrays',
    sections: {
      fr: [
        { type: 'intro', text: "Un tableau (array) est une collection d'éléments du même type, stockés en mémoire de façon contiguë. La taille est fixée à la création et ne peut pas changer." },
        { type: 'code', title: 'Déclaration et utilisation', code: `// Déclaration + initialisation\nint[] notes = {15, 12, 18, 9, 14};\n\n// Accès par index (commence à 0 !)\nSystem.out.println(notes[0]);  // 15\nSystem.out.println(notes[4]);  // 14\n\n// Longueur du tableau\nSystem.out.println(notes.length);  // 5\n\n// Parcours\nfor (int note : notes) {\n    System.out.print(note + " ");\n}\n// Affiche : 15 12 18 9 14` },
        { type: 'code', title: 'Tableau 2D', code: `int[][] grille = {\n    {1, 2, 3},\n    {4, 5, 6},\n    {7, 8, 9}\n};\nSystem.out.println(grille[1][2]);  // 6 (ligne 1, colonne 2)` },
        { type: 'tip', text: "Arrays.sort(tableau) trie un tableau. Arrays.toString(tableau) convertit un tableau en String pour l'afficher facilement." },
        { type: 'keypoints', points: ['Index commence à 0, donc le dernier index est tableau.length - 1', 'Dépasser les bornes → ArrayIndexOutOfBoundsException', 'La taille d\'un tableau est fixe (utilisez ArrayList si vous avez besoin d\'une taille dynamique)', 'import java.util.Arrays; pour les méthodes utilitaires'] },
      ],
      en: [
        { type: 'intro', text: "An array is a collection of elements of the same type stored contiguously in memory. The size is fixed at creation and cannot change." },
        { type: 'code', title: 'Declaration and usage', code: `// Declaration + initialization\nint[] scores = {15, 12, 18, 9, 14};\n\n// Access by index (starts at 0!)\nSystem.out.println(scores[0]);  // 15\nSystem.out.println(scores[4]);  // 14\n\n// Array length\nSystem.out.println(scores.length);  // 5\n\n// Iteration\nfor (int score : scores) {\n    System.out.print(score + " ");\n}` },
        { type: 'code', title: '2D Array', code: `int[][] grid = {\n    {1, 2, 3},\n    {4, 5, 6},\n    {7, 8, 9}\n};\nSystem.out.println(grid[1][2]);  // 6 (row 1, column 2)` },
        { type: 'tip', text: "Arrays.sort(array) sorts an array. Arrays.toString(array) converts an array to a String for easy printing." },
        { type: 'keypoints', points: ['Index starts at 0, so last index is array.length - 1', 'Going out of bounds → ArrayIndexOutOfBoundsException', 'Array size is fixed (use ArrayList for dynamic sizing)', 'import java.util.Arrays; for utility methods'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Tableaux

public class Challenge {
    public static void main(String[] args) {
        // TODO : Le défi est dans le panneau IA →

    }
}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Arrays

public class Challenge {
    public static void main(String[] args) {
        // TODO: The challenge is in the AI panel →

    }
}`,
  },

  strings: {
    titleFr: 'Chaînes de Caractères',
    titleEn: 'Strings & String Methods',
    descFr: 'Manipulation de String, StringBuilder et méthodes courantes',
    descEn: 'String manipulation, StringBuilder, common methods',
    sections: {
      fr: [
        { type: 'intro', text: "String est l'une des classes les plus utilisées en Java. Les Strings sont immuables : une fois créée, une chaîne ne peut pas être modifiée. Chaque opération crée un nouvel objet." },
        { type: 'code', title: 'Méthodes essentielles', code: `String s = "Bonjour Java";\n\nSystem.out.println(s.length());         // 12\nSystem.out.println(s.toUpperCase());    // BONJOUR JAVA\nSystem.out.println(s.toLowerCase());    // bonjour java\nSystem.out.println(s.charAt(0));        // 'B'\nSystem.out.println(s.substring(8));     // Java\nSystem.out.println(s.substring(0, 7)); // Bonjour\nSystem.out.println(s.contains("Java")); // true\nSystem.out.println(s.replace("Java", "Monde")); // Bonjour Monde\nSystem.out.println(s.trim());           // supprime espaces début/fin\nSystem.out.println(s.split(" ").length); // 2` },
        { type: 'concept', title: 'Comparaison de Strings', text: '⚠️ Ne jamais utiliser == pour comparer des Strings !\n✅ Utilisez .equals() pour comparer le contenu\n✅ Utilisez .equalsIgnoreCase() si la casse n\'importe pas' },
        { type: 'code', title: 'StringBuilder — pour construire des Strings efficacement', code: `StringBuilder sb = new StringBuilder();\nsb.append("Bonjour");\nsb.append(", ");\nsb.append("Monde !");\nString resultat = sb.toString();  // "Bonjour, Monde !"` },
        { type: 'keypoints', points: ['String est immuable → chaque modification crée un nouvel objet', 'Utilisez StringBuilder dans des boucles pour éviter de créer des milliers d\'objets', '.equals() pour comparer, jamais ==', 'String.format("Nom: %s, Age: %d", nom, age) pour le formatage'] },
      ],
      en: [
        { type: 'intro', text: "String is one of the most-used classes in Java. Strings are immutable: once created, a string cannot be modified. Every operation creates a new object." },
        { type: 'code', title: 'Essential methods', code: `String s = "Hello Java";\n\nSystem.out.println(s.length());          // 10\nSystem.out.println(s.toUpperCase());     // HELLO JAVA\nSystem.out.println(s.charAt(0));         // 'H'\nSystem.out.println(s.substring(6));      // Java\nSystem.out.println(s.contains("Java"));  // true\nSystem.out.println(s.replace("Java", "World")); // Hello World\nSystem.out.println(s.trim());            // removes leading/trailing spaces\nSystem.out.println(s.split(" ").length); // 2` },
        { type: 'concept', title: 'String comparison', text: '⚠️ Never use == to compare Strings!\n✅ Use .equals() to compare content\n✅ Use .equalsIgnoreCase() when case doesn\'t matter' },
        { type: 'code', title: 'StringBuilder — efficient string building', code: `StringBuilder sb = new StringBuilder();\nsb.append("Hello");\nsb.append(", ");\nsb.append("World!");\nString result = sb.toString();  // "Hello, World!"` },
        { type: 'keypoints', points: ['String is immutable → every modification creates a new object', 'Use StringBuilder in loops to avoid creating thousands of objects', '.equals() for comparison, never ==', 'String.format("Name: %s, Age: %d", name, age) for formatting'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Chaînes de Caractères

public class Challenge {
    public static void main(String[] args) {
        // TODO : Le défi est dans le panneau IA →

    }
}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Strings & String Methods

public class Challenge {
    public static void main(String[] args) {
        // TODO: The challenge is in the AI panel →

    }
}`,
  },

  // ── OOP ──────────────────────────────────────────────────────

  classes: {
    titleFr: 'Classes & Objets',
    titleEn: 'Classes & Objects',
    descFr: 'Créer des classes, constructeurs et variables d\'instance',
    descEn: 'Creating classes, constructors, instance variables',
    sections: {
      fr: [
        { type: 'intro', text: "Une classe est un plan (blueprint) pour créer des objets. Un objet est une instance d'une classe. Java est un langage orienté objet : tout est organisé autour de classes." },
        { type: 'code', title: 'Définir et utiliser une classe', code: `public class Voiture {\n    // Variables d'instance (attributs)\n    String marque;\n    int annee;\n    double prix;\n\n    // Constructeur\n    public Voiture(String marque, int annee, double prix) {\n        this.marque = marque;\n        this.annee = annee;\n        this.prix = prix;\n    }\n\n    // Méthode\n    public String presenter() {\n        return marque + " (" + annee + ") — " + prix + "€";\n    }\n}\n\n// Dans main :\nVoiture v = new Voiture("Renault", 2022, 18500.0);\nSystem.out.println(v.presenter());` },
        { type: 'tip', text: "this fait référence à l'objet courant. Il est utile quand un paramètre a le même nom qu'un attribut." },
        { type: 'keypoints', points: ['Une classe définit la structure, un objet est une instance concrète', 'Le constructeur initialise les attributs (même nom que la classe, pas de type de retour)', 'new crée un objet en mémoire et appelle le constructeur', 'Si aucun constructeur n\'est défini, Java en crée un par défaut (sans paramètres)'] },
      ],
      en: [
        { type: 'intro', text: "A class is a blueprint for creating objects. An object is an instance of a class. Java is object-oriented: everything is organized around classes." },
        { type: 'code', title: 'Define and use a class', code: `public class Car {\n    // Instance variables (attributes)\n    String brand;\n    int year;\n    double price;\n\n    // Constructor\n    public Car(String brand, int year, double price) {\n        this.brand = brand;\n        this.year = year;\n        this.price = price;\n    }\n\n    // Method\n    public String describe() {\n        return brand + " (" + year + ") — $" + price;\n    }\n}\n\n// In main:\nCar c = new Car("Toyota", 2022, 22000.0);\nSystem.out.println(c.describe());` },
        { type: 'tip', text: "this refers to the current object. It's useful when a parameter has the same name as an attribute." },
        { type: 'keypoints', points: ['A class defines the structure, an object is a concrete instance', 'The constructor initializes attributes (same name as class, no return type)', 'new creates an object in memory and calls the constructor', 'If no constructor is defined, Java creates a default one (no parameters)'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Classes & Objets

public class Challenge {\n    public static void main(String[] args) {\n        // TODO : Le défi est dans le panneau IA →\n\n    }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Classes & Objects\n\npublic class Challenge {\n    public static void main(String[] args) {\n        // TODO: The challenge is in the AI panel →\n\n    }\n}`,
  },

  // Generic template for remaining concepts
  encapsulation: {
    titleFr: 'Encapsulation',
    titleEn: 'Encapsulation',
    descFr: 'Modificateurs d\'accès, getters, setters et masquage des données',
    descEn: 'Access modifiers, getters, setters, data hiding',
    sections: {
      fr: [
        { type: 'intro', text: "L'encapsulation consiste à cacher les détails d'implémentation et à n'exposer que ce qui est nécessaire. C'est l'un des 4 piliers de la POO." },
        { type: 'code', title: 'Attributs privés + getters/setters', code: `public class CompteBancaire {\n    private double solde;  // private = inaccessible de l'extérieur\n    private String proprietaire;\n\n    public CompteBancaire(String proprietaire, double soldeInitial) {\n        this.proprietaire = proprietaire;\n        this.solde = soldeInitial;\n    }\n\n    // Getter\n    public double getSolde() { return solde; }\n\n    // Setter avec validation\n    public void deposer(double montant) {\n        if (montant > 0) solde += montant;\n    }\n\n    public boolean retirer(double montant) {\n        if (montant > 0 && montant <= solde) {\n            solde -= montant;\n            return true;\n        }\n        return false;\n    }\n}` },
        { type: 'keypoints', points: ['private : accessible uniquement dans la classe', 'public : accessible partout', 'protected : accessible dans le même package et sous-classes', 'Les setters permettent de valider les données avant de les modifier'] },
      ],
      en: [
        { type: 'intro', text: "Encapsulation means hiding implementation details and only exposing what's necessary. It's one of the 4 OOP pillars." },
        { type: 'code', title: 'Private fields + getters/setters', code: `public class BankAccount {\n    private double balance;  // private = inaccessible from outside\n    private String owner;\n\n    public BankAccount(String owner, double initialBalance) {\n        this.owner = owner;\n        this.balance = initialBalance;\n    }\n\n    public double getBalance() { return balance; }\n\n    public void deposit(double amount) {\n        if (amount > 0) balance += amount;\n    }\n\n    public boolean withdraw(double amount) {\n        if (amount > 0 && amount <= balance) {\n            balance -= amount;\n            return true;\n        }\n        return false;\n    }\n}` },
        { type: 'keypoints', points: ['private: accessible only within the class', 'public: accessible everywhere', 'protected: accessible in same package and subclasses', 'Setters allow validating data before modification'] },
      ],
    },
    challengeBoilerplateFr: `// 🎯 Défi : Encapsulation\n\npublic class Challenge {\n    public static void main(String[] args) {\n        // TODO : Le défi est dans le panneau IA →\n    }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Encapsulation\n\npublic class Challenge {\n    public static void main(String[] args) {\n        // TODO: The challenge is in the AI panel →\n    }\n}`,
  },

  inheritance: { titleFr: 'Héritage', titleEn: 'Inheritance', descFr: 'extends, super, redéfinition de méthodes', descEn: 'extends, super, method overriding',
    sections: { fr: [{ type: 'intro', text: "L'héritage permet à une classe d'hériter des attributs et méthodes d'une autre classe. La classe enfant étend la classe parent avec extends." }, { type: 'code', code: `public class Animal {\n    protected String nom;\n    public Animal(String nom) { this.nom = nom; }\n    public void faireDuBruit() { System.out.println("..."); }\n}\n\npublic class Chien extends Animal {\n    public Chien(String nom) { super(nom); }  // appel constructeur parent\n    @Override\n    public void faireDuBruit() { System.out.println(nom + " : Woof!"); }\n}\n\nChien c = new Chien("Rex");\nc.faireDuBruit();  // Rex : Woof!` }, { type: 'keypoints', points: ['extends pour hériter d\'une classe', '@Override pour redéfinir une méthode du parent', 'super() appelle le constructeur du parent', 'Java ne supporte que l\'héritage simple (une seule classe parent)'] }],
      en: [{ type: 'intro', text: "Inheritance allows a class to inherit attributes and methods from another class using extends." }, { type: 'code', code: `public class Animal {\n    protected String name;\n    public Animal(String name) { this.name = name; }\n    public void makeSound() { System.out.println("..."); }\n}\n\npublic class Dog extends Animal {\n    public Dog(String name) { super(name); }\n    @Override\n    public void makeSound() { System.out.println(name + ": Woof!"); }\n}` }, { type: 'keypoints', points: ['extends to inherit from a class', '@Override to redefine a parent method', 'super() calls the parent constructor', 'Java only supports single inheritance'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Héritage\n\npublic class Challenge {\n    public static void main(String[] args) {\n        // TODO : Le défi est dans le panneau IA →\n    }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Inheritance\n\npublic class Challenge {\n    public static void main(String[] args) {\n        // TODO: The challenge is in the AI panel →\n    }\n}`,
  },

  polymorphism: { titleFr: 'Polymorphisme', titleEn: 'Polymorphism', descFr: 'Polymorphisme de sous-type, transtypage et dispatch dynamique', descEn: 'Runtime polymorphism, upcasting, dynamic dispatch',
    sections: { fr: [{ type: 'intro', text: "Le polymorphisme permet de traiter des objets de types différents de manière uniforme via leur type parent. Java appelle automatiquement la bonne méthode selon le type réel de l'objet." }, { type: 'code', code: `Animal[] animaux = {\n    new Chien("Rex"),\n    new Chat("Mimi"),\n    new Oiseau("Titi")\n};\nfor (Animal a : animaux) {\n    a.faireDuBruit();  // Java appelle la bonne méthode !\n}` }, { type: 'keypoints', points: ['Un objet Chien peut être référencé comme Animal', 'La méthode appelée dépend du type réel (pas du type de la référence)', 'instanceof vérifie le type réel : if (a instanceof Chien c) {...}', 'instanceof avec pattern matching depuis Java 16'] }],
      en: [{ type: 'intro', text: "Polymorphism lets you treat objects of different types uniformly via their parent type. Java automatically calls the right method based on the object's actual type." }, { type: 'code', code: `Animal[] animals = { new Dog("Rex"), new Cat("Kitty") };\nfor (Animal a : animals) {\n    a.makeSound();  // Java calls the right method!\n}` }, { type: 'keypoints', points: ['A Dog object can be referenced as Animal', 'The method called depends on actual type (not reference type)', 'instanceof checks actual type', 'Pattern matching with instanceof since Java 16'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Polymorphisme\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Polymorphism\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  interfaces: { titleFr: 'Interfaces & Classes Abstraites', titleEn: 'Interfaces & Abstract Classes', descFr: 'interface, abstract class et méthodes par défaut', descEn: 'interface, abstract class, default methods',
    sections: { fr: [{ type: 'intro', text: "Une interface définit un contrat : les classes qui l'implémentent s'engagent à fournir certaines méthodes. Une classe abstraite ne peut pas être instanciée directement." }, { type: 'code', code: `public interface Dessinable {\n    void dessiner();  // méthode abstraite\n    default String getType() { return "Forme"; }  // méthode par défaut\n}\n\npublic abstract class Forme {\n    abstract double aire();  // sous-classes doivent implémenter\n    public void afficher() { System.out.println("Aire : " + aire()); }\n}\n\npublic class Cercle extends Forme implements Dessinable {\n    double r;\n    public Cercle(double r) { this.r = r; }\n    public double aire() { return Math.PI * r * r; }\n    public void dessiner() { System.out.println("O"); }\n}` }, { type: 'keypoints', points: ['Une classe peut implémenter plusieurs interfaces (mais étendre une seule classe)', 'interface = contrat pur (Java 8+ : méthodes default et static)', 'abstract class = partage de code + contrat mixte', 'implements pour les interfaces, extends pour les classes'] }],
      en: [{ type: 'intro', text: "An interface defines a contract: implementing classes commit to providing certain methods. An abstract class cannot be instantiated directly." }, { type: 'code', code: `public interface Drawable {\n    void draw();\n    default String getType() { return "Shape"; }\n}\n\npublic abstract class Shape {\n    abstract double area();\n    public void print() { System.out.println("Area: " + area()); }\n}\n\npublic class Circle extends Shape implements Drawable {\n    double r;\n    public Circle(double r) { this.r = r; }\n    public double area() { return Math.PI * r * r; }\n    public void draw() { System.out.println("O"); }\n}` }, { type: 'keypoints', points: ['A class can implement multiple interfaces (but extend only one class)', 'interface = pure contract (Java 8+: default and static methods)', 'abstract class = shared code + mixed contract', 'implements for interfaces, extends for classes'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Interfaces & Classes Abstraites\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Interfaces & Abstract Classes\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  collections: { titleFr: 'Collections Framework', titleEn: 'Collections Framework', descFr: 'ArrayList, HashMap, Set, Queue et LinkedList', descEn: 'ArrayList, HashMap, Set, Queue, LinkedList',
    sections: { fr: [{ type: 'intro', text: "Le Java Collections Framework fournit des structures de données réutilisables. Contrairement aux tableaux, elles sont dynamiques (taille variable)." }, { type: 'code', code: `import java.util.*;\n\n// ArrayList : liste ordonnée, accès par index\nList<String> fruits = new ArrayList<>();\nfruits.add("pomme"); fruits.add("banane"); fruits.add("cerise");\nSystem.out.println(fruits.get(1));  // banane\nfruits.remove("banane");\n\n// HashMap : clé → valeur\nMap<String, Integer> scores = new HashMap<>();\nscores.put("Alice", 95);\nscores.put("Bob", 82);\nSystem.out.println(scores.get("Alice"));  // 95\n\n// Set : pas de doublons\nSet<String> unique = new HashSet<>(List.of("a", "b", "a"));\nSystem.out.println(unique.size());  // 2` }, { type: 'keypoints', points: ['ArrayList pour des listes ordonnées avec accès rapide par index', 'HashMap pour les associations clé-valeur (accès O(1))', 'HashSet pour les ensembles sans doublons', 'Toujours déclarer avec l\'interface (List, Map, Set), pas l\'implémentation'] }],
      en: [{ type: 'intro', text: "The Java Collections Framework provides reusable data structures. Unlike arrays, they're dynamic (variable size)." }, { type: 'code', code: `import java.util.*;\n\nList<String> fruits = new ArrayList<>();\nfruits.add("apple"); fruits.add("banana");\nSystem.out.println(fruits.get(0));  // apple\n\nMap<String, Integer> scores = new HashMap<>();\nscores.put("Alice", 95);\nSystem.out.println(scores.get("Alice"));  // 95\n\nSet<String> unique = new HashSet<>(List.of("a","b","a"));\nSystem.out.println(unique.size());  // 2` }, { type: 'keypoints', points: ['ArrayList for ordered lists with fast index access', 'HashMap for key-value associations (O(1) access)', 'HashSet for sets without duplicates', 'Always declare with the interface (List, Map, Set)'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Collections Framework\n\nimport java.util.*;\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Collections Framework\n\nimport java.util.*;\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  exceptions: { titleFr: 'Gestion des Exceptions', titleEn: 'Exception Handling', descFr: 'try/catch/finally, exceptions personnalisées', descEn: 'try/catch/finally, custom exceptions',
    sections: { fr: [{ type: 'intro', text: "Les exceptions sont des événements anormaux qui interrompent le flux normal du programme. Java oblige à les gérer explicitement pour les checked exceptions." }, { type: 'code', code: `// try-catch-finally\ntry {\n    int[] arr = {1, 2, 3};\n    System.out.println(arr[10]);  // exception !\n} catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println("Erreur : " + e.getMessage());\n} finally {\n    System.out.println("Toujours exécuté (fermeture de ressources)");\n}\n\n// Exception personnalisée\npublic class AgeInvalideException extends RuntimeException {\n    public AgeInvalideException(int age) {\n        super("Âge invalide : " + age);\n    }\n}` }, { type: 'keypoints', points: ['try : code qui peut lancer une exception', 'catch : gère l\'exception', 'finally : toujours exécuté (nettoyage)', 'throw lance une exception, throws déclare qu\'une méthode peut en lancer une'] }],
      en: [{ type: 'intro', text: "Exceptions are abnormal events that interrupt normal program flow. Java forces explicit handling of checked exceptions." }, { type: 'code', code: `try {\n    int[] arr = {1, 2, 3};\n    System.out.println(arr[10]);  // exception!\n} catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println("Error: " + e.getMessage());\n} finally {\n    System.out.println("Always executed (resource cleanup)");\n}` }, { type: 'keypoints', points: ['try: code that may throw an exception', 'catch: handles the exception', 'finally: always executed (cleanup)', 'throw throws an exception, throws declares a method may throw one'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Gestion des Exceptions\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Exception Handling\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  generics: { titleFr: 'Généricité', titleEn: 'Generics', descFr: 'Types paramétrés, wildcards et méthodes génériques', descEn: 'Type parameters, bounded wildcards, generic methods',
    sections: { fr: [{ type: 'intro', text: "Les génériques permettent d'écrire du code réutilisable qui fonctionne avec n'importe quel type, tout en gardant la sécurité des types à la compilation." }, { type: 'code', code: `// Classe générique\npublic class Boite<T> {\n    private T contenu;\n    public void mettre(T item) { contenu = item; }\n    public T prendre() { return contenu; }\n}\n\nBoite<String> boiteStr = new Boite<>();\nboiteStr.mettre("Bonjour");\nString s = boiteStr.prendre();  // pas de cast nécessaire!\n\n// Méthode générique\npublic static <T> void echanger(T[] arr, int i, int j) {\n    T tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;\n}` }, { type: 'keypoints', points: ['<T> déclare un type paramètre (T, E, K, V sont des conventions)', 'Pas de types primitifs en générique : utilisez Integer, Double, Boolean', 'List<?> = wildcard (n\'importe quel type)', 'List<? extends Number> = wildcard borné supérieur'] }],
      en: [{ type: 'intro', text: "Generics let you write reusable code that works with any type while maintaining compile-time type safety." }, { type: 'code', code: `public class Box<T> {\n    private T content;\n    public void put(T item) { content = item; }\n    public T get() { return content; }\n}\n\nBox<String> strBox = new Box<>();\nstrBox.put("Hello");\nString s = strBox.get();  // no cast needed!\n\npublic static <T> void swap(T[] arr, int i, int j) {\n    T tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;\n}` }, { type: 'keypoints', points: ['<T> declares a type parameter (T, E, K, V are conventions)', 'No primitive types in generics: use Integer, Double, Boolean', 'List<?> = wildcard (any type)', 'List<? extends Number> = upper bounded wildcard'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Généricité\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Generics\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  lambdas: { titleFr: 'Lambdas & Interfaces Fonctionnelles', titleEn: 'Lambdas & Functional Interfaces', descFr: 'Expressions lambda, Function, Predicate, Consumer', descEn: 'Lambda expressions, Function, Predicate, Consumer',
    sections: { fr: [{ type: 'intro', text: "Les lambdas (Java 8+) permettent d'écrire des fonctions anonymes de façon concise. Elles sont utilisées partout : tri, filtrage, callbacks..." }, { type: 'code', code: `import java.util.*;\nimport java.util.function.*;\n\n// Syntaxe : (paramètres) -> corps\nRunnable r = () -> System.out.println("Hello!");\nr.run();\n\nComparator<String> comp = (a, b) -> a.length() - b.length();\nList<String> mots = new ArrayList<>(List.of("chat","éléphant","rat"));\nmots.sort(comp);\n\n// Interfaces fonctionnelles clés\nPredicate<Integer> estPair = n -> n % 2 == 0;\nFunction<String, Integer> longueur = String::length;  // méthode référence\nConsumer<String> afficher = System.out::println;` }, { type: 'keypoints', points: ['(params) -> expression OU (params) -> { instructions; }', 'Les lambdas implémentent des interfaces fonctionnelles (@FunctionalInterface)', 'Classe::méthode est une référence de méthode (plus lisible qu\'une lambda)', 'Les 4 interfaces clés : Predicate<T>, Function<T,R>, Consumer<T>, Supplier<T>'] }],
      en: [{ type: 'intro', text: "Lambdas (Java 8+) let you write anonymous functions concisely. They're used everywhere: sorting, filtering, callbacks..." }, { type: 'code', code: `import java.util.function.*;\n\nRunnable r = () -> System.out.println("Hello!");\nr.run();\n\nPredicate<Integer> isEven = n -> n % 2 == 0;\nFunction<String, Integer> length = String::length;\nConsumer<String> print = System.out::println;` }, { type: 'keypoints', points: ['(params) -> expression OR (params) -> { statements; }', 'Lambdas implement functional interfaces (@FunctionalInterface)', 'Class::method is a method reference (more readable than lambda)', 'Key interfaces: Predicate<T>, Function<T,R>, Consumer<T>, Supplier<T>'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Lambdas & Interfaces Fonctionnelles\n\nimport java.util.function.*;\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Lambdas & Functional Interfaces\n\nimport java.util.function.*;\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  streams: { titleFr: 'API Streams', titleEn: 'Streams API', descFr: 'map, filter, reduce, collect et streams parallèles', descEn: 'map, filter, reduce, collect, parallel streams',
    sections: { fr: [{ type: 'intro', text: "L'API Streams (Java 8+) permet de traiter des collections de façon fonctionnelle et déclarative. Elle transforme \"comment faire\" en \"quoi faire\"." }, { type: 'code', code: `import java.util.*;\nimport java.util.stream.*;\n\nList<Integer> nombres = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);\n\n// Filtrer les pairs, les doubler, les sommer\nint somme = nombres.stream()\n    .filter(n -> n % 2 == 0)    // 2,4,6,8,10\n    .mapToInt(n -> n * 2)       // 4,8,12,16,20\n    .sum();                     // 60\n\n// Convertir en liste\nList<String> mots = List.of("chat","Chien","OISEAU","rat");\nList<String> tries = mots.stream()\n    .map(String::toLowerCase)\n    .sorted()\n    .collect(Collectors.toList());` }, { type: 'keypoints', points: ['Stream = pipeline de transformations paresseux (lazy)', 'Opérations intermédiaires : filter, map, sorted, distinct, limit', 'Opérations terminales : collect, forEach, sum, count, findFirst', 'parallelStream() pour paralléliser automatiquement'] }],
      en: [{ type: 'intro', text: "The Streams API (Java 8+) processes collections in a functional, declarative way. It transforms \"how to do\" into \"what to do\"." }, { type: 'code', code: `List<Integer> numbers = List.of(1,2,3,4,5,6,7,8,9,10);\n\nint sum = numbers.stream()\n    .filter(n -> n % 2 == 0)\n    .mapToInt(n -> n * 2)\n    .sum();  // 60\n\nList<String> words = List.of("cat","Dog","BIRD","rat");\nList<String> sorted = words.stream()\n    .map(String::toLowerCase)\n    .sorted()\n    .collect(Collectors.toList());` }, { type: 'keypoints', points: ['Stream = lazy transformation pipeline', 'Intermediate ops: filter, map, sorted, distinct, limit', 'Terminal ops: collect, forEach, sum, count, findFirst', 'parallelStream() for automatic parallelization'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : API Streams\n\nimport java.util.*;\nimport java.util.stream.*;\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Streams API\n\nimport java.util.*;\nimport java.util.stream.*;\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  optional: { titleFr: 'Optional & Null Safety', titleEn: 'Optional & Null Safety', descFr: 'Éviter les NullPointerException avec Optional', descEn: 'Optional class, avoiding NullPointerException',
    sections: { fr: [{ type: 'intro', text: "NullPointerException est l'erreur la plus fréquente en Java. Optional (Java 8+) est un conteneur qui peut ou non contenir une valeur — il rend l'absence de valeur explicite." }, { type: 'code', code: `import java.util.Optional;\n\nOptional<String> nom = Optional.of("Alice");\nOptional<String> vide = Optional.empty();\n\n// Utilisation sûre\nnom.ifPresent(n -> System.out.println("Bonjour, " + n));\nString result = vide.orElse("Inconnu");\nString result2 = vide.orElseGet(() -> "Défaut calculé");\n\n// Chaînage\nOptional<Integer> longueur = nom\n    .map(String::length);\nSystem.out.println(longueur.get());  // 5` }, { type: 'keypoints', points: ['Ne jamais appeler .get() sans vérifier isPresent() (peut lever NoSuchElementException)', '.orElse() retourne une valeur par défaut', '.orElseThrow() lance une exception si vide', 'Optional est prévu pour les valeurs de retour, pas pour les paramètres'] }],
      en: [{ type: 'intro', text: "NullPointerException is the most common Java error. Optional (Java 8+) is a container that may or may not hold a value — making the absence of a value explicit." }, { type: 'code', code: `Optional<String> name = Optional.of("Alice");\nOptional<String> empty = Optional.empty();\n\nname.ifPresent(n -> System.out.println("Hello, " + n));\nString result = empty.orElse("Unknown");\n\nOptional<Integer> length = name.map(String::length);\nSystem.out.println(length.get());  // 5` }, { type: 'keypoints', points: ['Never call .get() without checking isPresent()', '.orElse() returns a default value', '.orElseThrow() throws if empty', 'Optional is meant for return values, not parameters'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Optional & Null Safety\n\nimport java.util.Optional;\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Optional & Null Safety\n\nimport java.util.Optional;\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  concurrency: { titleFr: 'Concurrence & Threads', titleEn: 'Concurrency & Threads', descFr: 'Thread, Runnable, synchronized et ExecutorService', descEn: 'Thread, Runnable, synchronized, ExecutorService',
    sections: { fr: [{ type: 'intro', text: "Les threads permettent d'exécuter plusieurs tâches en parallèle. Java intègre la gestion des threads dans le langage avec synchronized et l'API concurrent." }, { type: 'code', code: `// Thread via Runnable (recommandé)\nRunnable tache = () -> {\n    for (int i = 0; i < 5; i++) {\n        System.out.println(Thread.currentThread().getName() + " : " + i);\n    }\n};\n\nnew Thread(tache, "Thread-1").start();\nnew Thread(tache, "Thread-2").start();\n\n// ExecutorService (mieux pour la production)\nimport java.util.concurrent.*;\nExecutorService pool = Executors.newFixedThreadPool(4);\npool.submit(tache);\npool.shutdown();` }, { type: 'keypoints', points: ['Thread.start() démarre le thread, .run() ne crée pas de nouveau thread', 'synchronized protège une méthode ou un bloc contre les accès concurrents', 'Préférer ExecutorService à la création manuelle de threads', 'volatile garantit la visibilité entre threads'] }],
      en: [{ type: 'intro', text: "Threads allow parallel execution of tasks. Java has built-in thread management with synchronized and the concurrent API." }, { type: 'code', code: `Runnable task = () -> {\n    for (int i = 0; i < 5; i++)\n        System.out.println(Thread.currentThread().getName() + ": " + i);\n};\n\nnew Thread(task, "Thread-1").start();\nnew Thread(task, "Thread-2").start();\n\nExecutorService pool = Executors.newFixedThreadPool(4);\npool.submit(task);\npool.shutdown();` }, { type: 'keypoints', points: ['Thread.start() starts a new thread; .run() doesn\'t', 'synchronized protects against concurrent access', 'Prefer ExecutorService over manual thread creation', 'volatile ensures visibility between threads'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Concurrence & Threads\n\npublic class Challenge {\n    public static void main(String[] args) throws InterruptedException { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Concurrency & Threads\n\npublic class Challenge {\n    public static void main(String[] args) throws InterruptedException { /* TODO */ }\n}`,
  },

  'design-patterns': { titleFr: 'Patrons de Conception', titleEn: 'Design Patterns', descFr: 'Singleton, Factory, Observer, Strategy, Builder', descEn: 'Singleton, Factory, Observer, Strategy, Builder',
    sections: { fr: [{ type: 'intro', text: "Les patrons de conception sont des solutions éprouvées à des problèmes récurrents en conception logicielle. Ils constituent un vocabulaire commun entre développeurs." }, { type: 'code', title: 'Singleton — une seule instance', code: `public class ConfigManager {\n    private static ConfigManager instance;\n    private ConfigManager() {}  // constructeur privé\n    public static ConfigManager getInstance() {\n        if (instance == null) instance = new ConfigManager();\n        return instance;\n    }\n}` }, { type: 'code', title: 'Builder — construction pas à pas', code: `Pizza pizza = new Pizza.Builder()\n    .taille("Grande")\n    .fromage(true)\n    .garniture("Champignons")\n    .build();` }, { type: 'keypoints', points: ['Singleton : une seule instance globale', 'Factory : délègue la création d\'objets', 'Observer : notification automatique des dépendants', 'Strategy : algorithmes interchangeables', 'Builder : construction complexe étape par étape'] }],
      en: [{ type: 'intro', text: "Design patterns are proven solutions to recurring software design problems. They form a common vocabulary between developers." }, { type: 'code', title: 'Singleton — single instance', code: `public class ConfigManager {\n    private static ConfigManager instance;\n    private ConfigManager() {}\n    public static ConfigManager getInstance() {\n        if (instance == null) instance = new ConfigManager();\n        return instance;\n    }\n}` }, { type: 'keypoints', points: ['Singleton: single global instance', 'Factory: delegates object creation', 'Observer: automatic dependent notification', 'Strategy: interchangeable algorithms', 'Builder: step-by-step complex construction'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : Patrons de Conception\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: Design Patterns\n\npublic class Challenge {\n    public static void main(String[] args) { /* TODO */ }\n}`,
  },

  io: { titleFr: 'I/O Fichiers', titleEn: 'File I/O', descFr: 'Files, Path, BufferedReader et NIO2', descEn: 'Files, Path, BufferedReader, NIO2',
    sections: { fr: [{ type: 'intro', text: "Java offre deux API pour les fichiers : l'ancienne (java.io) et NIO2 (java.nio.file, Java 7+). Préférez NIO2 pour les nouveaux projets." }, { type: 'code', code: `import java.nio.file.*;\nimport java.io.IOException;\nimport java.util.List;\n\n// Lire un fichier entier\nPath chemin = Path.of("données.txt");\nList<String> lignes = Files.readAllLines(chemin);\nfor (String ligne : lignes) System.out.println(ligne);\n\n// Écrire dans un fichier\nString contenu = "Bonjour fichier !\\nLigne 2";\nFiles.writeString(Path.of("sortie.txt"), contenu);\n\n// Vérifications\nFiles.exists(chemin);      // existe ?\nFiles.isDirectory(chemin); // est un dossier ?` }, { type: 'keypoints', points: ['Path.of() crée un chemin (depuis Java 11)', 'Files.readAllLines() lit tout en mémoire (bon pour petits fichiers)', 'BufferedReader pour lire ligne par ligne les grands fichiers', 'Toujours gérer IOException (checked exception)'] }],
      en: [{ type: 'intro', text: "Java offers two file APIs: the old one (java.io) and NIO2 (java.nio.file, Java 7+). Prefer NIO2 for new projects." }, { type: 'code', code: `import java.nio.file.*;\nimport java.util.List;\n\nPath path = Path.of("data.txt");\nList<String> lines = Files.readAllLines(path);\nfor (String line : lines) System.out.println(line);\n\nFiles.writeString(Path.of("output.txt"), "Hello file!");\n\nFiles.exists(path);\nFiles.isDirectory(path);` }, { type: 'keypoints', points: ['Path.of() creates a path (since Java 11)', 'Files.readAllLines() reads all into memory (good for small files)', 'BufferedReader for line-by-line reading of large files', 'Always handle IOException (checked exception)'] }] },
    challengeBoilerplateFr: `// 🎯 Défi : I/O Fichiers\n\nimport java.nio.file.*;\n\npublic class Challenge {\n    public static void main(String[] args) throws Exception { /* TODO */ }\n}`,
    challengeBoilerplateEn: `// 🎯 Challenge: File I/O\n\nimport java.nio.file.*;\n\npublic class Challenge {\n    public static void main(String[] args) throws Exception { /* TODO */ }\n}`,
  },
}

export function getLessonContent(conceptId: string): LessonData | null {
  return LESSONS[conceptId] ?? null
}

export function getLessonTitle(conceptId: string, lang: 'fr' | 'en'): string {
  const lesson = LESSONS[conceptId]
  if (!lesson) return conceptId
  return lang === 'fr' ? lesson.titleFr : lesson.titleEn
}
