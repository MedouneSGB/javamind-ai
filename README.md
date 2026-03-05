# JavaMind AI ✦

> Java IDE de bureau avec IA intégrée (Claude API) pour apprendre et développer en Java.

![Version](https://img.shields.io/badge/version-0.1.0-d4a574) ![License](https://img.shields.io/badge/license-MIT-green) ![Stack](https://img.shields.io/badge/stack-Electron%20%2B%20React%20%2B%20Claude-blue)

---

## Aperçu

JavaMind AI est un IDE Java qui combine un environnement de développement complet avec une plateforme d'apprentissage pilotée par l'IA Claude. Interface aux couleurs de Claude (beige chaud / noir profond).

### Features

| Feature | Description |
|---|---|
| **Monaco Editor** | Éditeur VS Code avec thème `claude-dark`, autocomplétion Java |
| **Compilation Java** | Compile et exécute du Java (javac/java), erreurs en squiggles rouges |
| **✦ AI Mentor Chat** | Chat contextuel qui voit ton code courant |
| **📚 Code Tutor** | Explication pas à pas de ton code avec analogies |
| **🔍 Code Review** | Revue complète (best practices, Java idioms) |
| **🎯 Challenge Mode** | Défis adaptatifs avec timer + hints + scoring |
| **🦆 Rubber Duck Debug** | L'IA pose des questions Socratiques (jamais la réponse) |
| **💼 Interview Prep** | Mock entretien Java (Junior/Mid/Senior) |
| **🎓 Learning Path** | Curriculum Java visuel (22 concepts, 3 tracks) |
| **🔥 Daily Kata** | Exercice quotidien + streak counter |

---

## Installation

### Prérequis
- Node.js 18+
- Java 17+ (JDK, `javac` et `java` dans le PATH)
- Une clé API Anthropic ([console.anthropic.com](https://console.anthropic.com))

### Setup

```bash
git clone https://github.com/MedouneSGB/javamind-ai.git
cd javamind-ai
npm install
```

Configurer la clé API dans `.env` :
```bash
cp .env.example .env
# Éditer .env et ajouter: ANTHROPIC_API_KEY=sk-ant-...
```

### Lancer en développement

```bash
npm run dev
```

### Build production

```bash
npm run build
# → dist/app/ contient l'installateur
```

---

## Architecture

```
electron/           ← Main process (Node.js)
  main.ts           ← BrowserWindow, IPC handlers
  preload.ts        ← contextBridge API

src/
  components/
    layout/         ← AppShell, TitleBar, Toolbar, StatusBar
    editor/         ← Monaco Editor, tabs
    sidebar/        ← FileExplorer, LearningNav
    terminal/       ← OutputConsole, TerminalPane
    ai/             ← AiChat, CodeTutor, ChallengeMode, RubberDuck...
  store/            ← Zustand stores (editor, project, ai, learning)
  hooks/            ← useJavaRunner, useAiStream
  lib/              ← IPC, prompt templates, curriculum
```

---

## Sécurité

- La clé API Anthropic réside **uniquement dans le main process** (jamais dans le renderer)
- Stockage chiffré via `electron.safeStorage`
- Aucune donnée utilisateur envoyée sans consentement explicite

---

## Roadmap

Voir le [GitHub Project Board](https://github.com/users/MedouneSGB/projects/2) pour le suivi.

- [x] Phase 0 — Scaffold
- [x] Phase 1 — Core IDE Shell
- [x] Phase 2 — Java Compilation
- [x] Phase 3 — AI Foundation
- [x] Phase 4 — Learning System
- [x] Phase 5 — Advanced AI Features
- [ ] Phase 6 — Polish & Build Packaging
- [ ] Phase 7 — AI Pair Programmer
- [ ] Phase 8 — node-pty Terminal Integration

---

## Licence

MIT — Fait avec ❤️ et Claude AI
