# 🙏 Théologie pour Tous

> **Plateforme d'enseignement biblique et théologique moderne**

Théologie pour Tous est une application web complète dédiée à l'étude de la Bible et à l'enseignement théologique. Elle offre une expérience interactive pour approfondir sa compréhension des Écritures à travers des cours structurés, des outils de lecture et de prise de notes.

![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Sanctum](https://img.shields.io/badge/Sanctum-Token%20Auth-EF4444)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)

## ✨ Fonctionnalités principales

### 📖 Lecteur de Bible intégré
- **Lecture multi-versions** : LSG, S21, NEG, BDS et plus
- **Navigation intuitive** par livre, chapitre et verset
- **Comparaison de versions** côte à côte
- **Mode sombre/clair** pour le confort de lecture

### 🎓 Système d'enseignement
- **Cours de théologie structurés** par thèmes
- **Suivi de progression** personnalisé
- **Références bibliques interactives** avec liens directs
- **Contenu markdown enrichi** avec table des matières

### 📝 Gestion de notes et signets
- **Prise de notes** sur les versets
- **Système de signets colorés** pour organiser ses versets favoris
- **Notes publiques/privées** avec partage communautaire
- **Recherche et filtrage** par livre, couleur, confidentialité

### 📊 Statistiques et suivi
- **Tableau de bord de lecture** avec métriques détaillées
- **Graphiques de progression** par période
- **Suivi des chapitres lus** et temps de lecture
- **Objectifs personnalisables** et réalisations

### 🔐 Authentification et profils
- **Authentification Sanctum par token**
- **Profils utilisateur personnalisables**
- **Paramètres et préférences** de lecture

## 🚀 Technologies utilisées

### Frontend
- **Nuxt 4** - Framework Vue.js full-stack
- **Vue 3** - Framework JavaScript réactif
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Nuxt UI** - Composants UI modernes
- **Nuxt Content** - Gestion de contenu markdown

### Backend & API
- **Laravel API v1** - Backend metier externe
- **Laravel Sanctum** - Authentification par Bearer token
- **Nuxt Server API** - Proxy Sanctum local et endpoints Bible publics

### Outils de développement
- **ESLint** - Linting et qualité de code
- **Prettier** - Formatage automatique
- **TypeScript** - Vérification de types
- **Renovate** - Mise à jour automatique des dépendances

## 📋 Prérequis

- **Node.js** 18.x ou supérieur
- **Backend Laravel** accessible en local ou a distance

## 🛠️ Configuration

### 3. Variables d'environnement
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
# NUXT_PUBLIC_SITE_URL="http://localhost:3000"
# NUXT_PUBLIC_API_BASE_URL="http://localhost:8000"
```

`NUXT_PUBLIC_API_BASE_URL` doit pointer vers le backend Laravel qui expose l'API documentee dans [docs/api-reference-for-copilot.md](docs/api-reference-for-copilot.md).

### 4. Lancer le serveur de développement
```bash
npm run dev
```

L'application sera accessible à l'adresse `http://localhost:3000`

## 🔐 Flux d'authentification

- Le frontend utilise `nuxt-auth-sanctum` en mode `token`.
- Nuxt proxifie les appels Sanctum via `/api/sanctum`.
- Le token d'authentification est stocke dans le cookie `sanctum.token.cookie`.
- L'identite utilisateur chargee par le frontend passe par une route locale qui adapte la reponse backend `/api/v1/me`.

## 🔌 Architecture des appels API

- Les ressources authentifiees `profile`, `preference-settings`, `bible-notes`, `bible-bookmarks` et `lesson-progress-entries` sont appelees directement depuis le frontend via `nuxt-auth-sanctum`.
- Les composables front reconstruisent les objets UI necessaires a partir des reponses backend et des donnees Nuxt Content.
- Nitro ne garde plus que ces responsabilites:
	- exposer le proxy local `/api/sanctum`
	- fournir `GET /api/sanctum/identity` pour adapter l'utilisateur backend au format attendu par `nuxt-auth-sanctum`
	- servir les endpoints Bible publics sous `/api/bible/**`
- Certaines metadonnees purement UI sont persistees cote frontend, par exemple les couleurs de signets, les titres personnalises et certains drapeaux de preferences de lecture.

## 📝 Scripts disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run preview          # Aperçu du build
npm run generate         # Génération statique

# Qualité de code
npm run lint             # Correction ESLint
npm run lint:fix         # Correction automatique ESLint
npm run typecheck        # Vérification TypeScript
npm run check:all        # Vérification complète (lint + types)
```

## 🗂️ Structure du projet

```
📁 theologiepourtous/
├── 📁 app/                    # Code source Nuxt
│   ├── 📁 components/         # Composants Vue réutilisables
│   ├── 📁 composables/        # Logique métier réactive
│   ├── 📁 layouts/            # Templates de mise en page
│   ├── 📁 middleware/         # Middlewares de route
│   ├── 📁 pages/              # Pages et routes automatiques
│   ├── 📁 plugins/            # Plugins Nuxt
│   └── 📁 utils/              # Utilitaires et helpers
├── 📁 content/                # Contenu markdown (cours)
├── 📁 server/                 # Proxy Sanctum local et endpoints Bible publics
├── 📁 public/                 # Assets statiques
└── 📄 nuxt.config.ts          # Configuration Nuxt
```

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Mickaël N.**
- GitHub: [@Micky-N](https://github.com/Micky-N)
- Email: contact@theologiepourtous.com