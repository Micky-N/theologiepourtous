# 🙏 Théologie pour Tous

> **Plateforme d'enseignement biblique et théologique moderne**

Théologie pour Tous est une application web complète dédiée à l'étude de la Bible et à l'enseignement théologique. Elle offre une expérience interactive pour approfondir sa compréhension des Écritures à travers des cours structurés, des outils de lecture et de prise de notes.

![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82?logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
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
- **Système d'authentification sécurisé**
- **Profils utilisateur personnalisables**
- **Paramètres et préférences** de lecture

## 🚀 Technologies utilisées

### Frontend
- **Nuxt 3** - Framework Vue.js full-stack
- **Vue 3** - Framework JavaScript réactif
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Nuxt UI** - Composants UI modernes
- **Nuxt Content** - Gestion de contenu markdown

### Backend & Base de données
- **Prisma ORM** - Gestionnaire de base de données
- **MySQL** - Base de données
- **Nuxt Server API** - API RESTful intégrée

### Outils de développement
- **ESLint** - Linting et qualité de code
- **Prettier** - Formatage automatique
- **TypeScript** - Vérification de types
- **Renovate** - Mise à jour automatique des dépendances

## 📋 Prérequis

- **Node.js** 18.x ou supérieur
- **Base de données** SQLite ou MySQL

## 🛠️ Configuration

### 3. Base de données
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
# DATABASE_PROVIDER="sqlite"    # ou "mysql"
# DATABASE_URL="file:./dev.db"  # SQLite pour le développement
# NUXT_SESSION_PASSWORD="your-secret-key"
# NUXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Prisma ne permet pas d'utiliser `env()` dans `datasource.provider`.
Le projet choisit donc automatiquement le bon schéma Prisma et le bon dossier de migrations à partir de `DATABASE_PROVIDER` dans [prisma.config.ts](prisma.config.ts).

### 4. Initialiser la base de données
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Peupler la base avec des données de test (optionnel)
npx prisma db seed
```

### 5. Lancer le serveur de développement
```bash
npm run dev
```

L'application sera accessible à l'adresse `http://localhost:3000`

## 📝 Scripts disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run preview          # Aperçu du build
npm run generate         # Génération statique

# Base de données
npm run db:generate      # Générer le client Prisma
npm run db:migrate       # Appliquer les migrations
npm run db:seed          # Peupler la base de données
npm run db:studio        # Interface graphique Prisma Studio

# Qualité de code
npm run lint             # Vérification ESLint
npm run lint:fix         # Correction automatique ESLint
npm run type-check       # Vérification TypeScript
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
├── 📁 prisma/                 # Schéma et migrations DB
├── 📁 server/                 # API routes serveur
├── 📁 public/                 # Assets statiques
└── 📄 nuxt.config.ts          # Configuration Nuxt
```

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Mickaël N.**
- GitHub: [@Micky-N](https://github.com/Micky-N)
- Email: contact@theologiepourtous.com