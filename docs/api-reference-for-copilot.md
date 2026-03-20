# Reference API v1 - Theologie Pour Tous

Ce document resume le contrat actuel de l'API backend pour etre reutilise comme contexte par Copilot dans un autre projet.

## Base URL

- Url API: `http://localhost:8000/api/v1`
- Authentification: Bearer token Sanctum via l'en-tete `Authorization: Bearer <token>`
- Format: JSON

## Integration frontend Nuxt

- Le frontend Nuxt utilise `nuxt-auth-sanctum` en mode `token`.
- La base Sanctum cote Nuxt est configuree sur `/api/sanctum` avec proxy serveur vers `NUXT_PUBLIC_API_BASE_URL`.
- Les endpoints Sanctum utilises par le frontend sont:
  - `POST /api/sanctum/api/v1/login`
  - `POST /api/sanctum/api/v1/logout`
  - `GET /api/sanctum/identity`
- La route locale `GET /api/sanctum/identity` appelle le backend sur `/api/v1/me` puis enrichit l'utilisateur avec `/api/v1/preference-settings` pour retourner un objet utilisateur directement exploitable par le frontend.

## Routes locales Nuxt encore presentes

Les ressources metier authentifiees ne passent plus par des routes Nitro dediees. Elles sont appelees directement depuis le frontend via le client Sanctum.

Les routes locales Nuxt restantes sont limitees a:

- `GET /api/sanctum/identity`
- `ALL /api/sanctum/**`
- les endpoints Bible publics sous `/api/bible/**` pour livres, versions, versets, recherche et comparaison

## Ressources backend appelees directement par le frontend

Le frontend appelle directement via Sanctum les endpoints backend suivants:

- `PUT /api/v1/profile`
- `POST /api/v1/profile/delete-account`
- `GET /api/v1/preference-settings`
- `PATCH /api/v1/preference-settings`
- `GET /api/v1/bible-notes`
- `POST /api/v1/bible-notes`
- `PATCH /api/v1/bible-notes/{note}`
- `DELETE /api/v1/bible-notes/{note}`
- `GET /api/v1/bible-bookmarks`
- `POST /api/v1/bible-bookmarks`
- `DELETE /api/v1/bible-bookmarks/{bookmark}`
- `GET /api/v1/lesson-progress-entries`
- `POST /api/v1/lesson-progress-entries`

Notes d'integration frontend:

- les drapeaux `notesPerVersion` et `bookmarksPerVersion` sont conserves cote frontend puis fusionnes avec `preference-settings`
- certaines metadonnees UI absentes de l'API backend, comme les titres de notes, les couleurs de signets et les titres personnalises, sont reconstruites et persistees cote frontend
- la progression d'enseignement est reconstruite cote frontend a partir de `lesson-progress-entries` et de la collection Nuxt Content `lessons`

## Conventions de reponse

- Les endpoints de type resource Laravel renvoient en general un objet `data` pour un item unique.
- Les collections renvoient en general un tableau `data`.
- Les endpoints d'authentification `register` et `login` renvoient directement un objet avec `token` et `user`.
- Les endpoints `logout`, suppression de note et suppression de bookmark renvoient un message simple.
- Les erreurs de validation Laravel renvoient le format standard avec `message` et `errors`.

## Authentification

### POST /api/v1/register

Creer un compte utilisateur.

Request body:

```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "secret123",
  "confirm_password": "secret123"
}
```

Validation:

- `name`: requis
- `email`: requis, email valide, unique dans `users`
- `password`: requis, longueur minimale 6
- `confirm_password`: requis, doit correspondre a `password`

Response 200:

```json
{
  "token": "1|sanctum_token",
  "user": {
    "id": "uuid",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "user",
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:00:00.000000Z"
  }
}
```

Notes:

- Le role est force a `user` a l'inscription.

### POST /api/v1/login

Authentifier un utilisateur existant.

Request body:

```json
{
  "email": "jean@example.com",
  "password": "secret123"
}
```

Response 200:

```json
{
  "token": "2|sanctum_token",
  "user": {
    "id": "uuid",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "user",
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:00:00.000000Z"
  }
}
```

Response 401:

```json
{
  "message": "Invalid credentials"
}
```

### GET /api/v1/me

Retourne l'utilisateur authentifie.

Auth requise: oui

Response 200:

```json
{
  "data": {
    "id": "uuid",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "user",
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:00:00.000000Z"
  }
}
```

### POST /api/v1/logout

Supprime tous les tokens de l'utilisateur authentifie.

Auth requise: oui

Response 200:

```json
{
  "message": "Logged out"
}
```

## Profile

### PUT /api/v1/profile

Mettre a jour le profil de l'utilisateur authentifie.

Auth requise: oui

Request body:

```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "current_password": "ancienMotDePasse123",
  "new_password": "NouveauSecret123",
  "confirm_password": "NouveauSecret123"
}
```

Validation:

- `name`: requis, string, longueur minimale 2
- `email`: requis, email valide, unique hors utilisateur courant
- `current_password`: nullable, requis si `new_password` est fourni
- `new_password`: nullable, longueur minimale 7 si fourni
- `confirm_password`: nullable, doit correspondre a `new_password` si fourni

Comportement:

- si `new_password` est absent, l'endpoint met a jour seulement `name` et `email`
- si `new_password` est fourni, l'endpoint verifie `current_password`
- le role utilisateur n'est pas modifiable via cet endpoint

Response 200:

```json
{
  "message": "Utilisateur mis a jour avec succes",
  "data": {
    "id": "uuid",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "user",
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:05:00.000000Z"
  }
}
```

Response 401:

```json
{
  "message": "Mot de passe incorrect"
}
```

### POST /api/v1/profile/delete-account

Supprimer le compte de l'utilisateur authentifie.

Auth requise: oui

Request body:

```json
{
  "password": "secret123"
}
```

Validation:

- `password`: requis

Comportement:

- verifie le mot de passe de l'utilisateur
- supprime le compte
- supprime ou invalide les donnees associees selon les relations backend
- revoque les tokens Sanctum de l'utilisateur

Response 200:

```json
{
  "message": "Compte supprime avec succes"
}
```

## Bible Notes

### GET /api/v1/bible-notes

Liste les notes bibliques de l'utilisateur connecte, triees par `created_at` decroissant.

Auth requise: oui

Response 200:

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "book_code": "JHN",
      "chapter": 3,
      "verse": 16,
      "text": "Texte de la note",
      "is_public": false,
      "created_at": "2026-03-19T15:00:00.000000Z",
      "updated_at": "2026-03-19T15:00:00.000000Z"
    }
  ]
}
```

### POST /api/v1/bible-notes

Creer une note biblique.

Auth requise: oui

Request body:

```json
{
  "book_code": "JHN",
  "chapter": 3,
  "verse": 16,
  "text": "Texte de la note",
  "is_public": false
}
```

Validation:

- `book_code`: requis, string
- `chapter`: requis, integer
- `verse`: requis, integer
- `text`: requis, string
- `is_public`: optionnel, boolean

Response 200:

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "book_code": "JHN",
    "chapter": 3,
    "verse": 16,
    "text": "Texte de la note",
    "is_public": false,
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:00:00.000000Z"
  }
}
```

### GET /api/v1/bible-notes/{note}

Retourne une note biblique par son identifiant UUID.

Auth requise: oui

Response 200:

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "book_code": "JHN",
    "chapter": 3,
    "verse": 16,
    "text": "Texte de la note",
    "is_public": false,
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:00:00.000000Z"
  }
}
```

### PUT/PATCH /api/v1/bible-notes/{note}

Mettre a jour une note biblique existante.

Auth requise: oui

Request body:

```json
{
  "text": "Nouveau texte",
  "is_public": true
}
```

Validation:

- `text`: requis, string
- `is_public`: optionnel, boolean

Important:

- `book_code`, `chapter` et `verse` ne sont pas modifiables via cet endpoint.

Response 200:

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "book_code": "JHN",
    "chapter": 3,
    "verse": 16,
    "text": "Nouveau texte",
    "is_public": true,
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:05:00.000000Z"
  }
}
```

### DELETE /api/v1/bible-notes/{note}

Supprimer une note biblique.

Auth requise: oui

Response 200:

```json
{
  "message": "Note deleted"
}
```

## Bible Bookmarks

### GET /api/v1/bible-bookmarks

Liste les signets bibliques de l'utilisateur connecte.

Auth requise: oui

Response 200:

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "book_code": "JHN",
      "chapter": 3,
      "verse": 16,
      "created_at": "2026-03-19T15:00:00.000000Z",
      "updated_at": "2026-03-19T15:00:00.000000Z"
    }
  ]
}
```

### POST /api/v1/bible-bookmarks

Creer un signet biblique.

Auth requise: oui

Request body:

```json
{
  "book_code": "JHN",
  "chapter": 3,
  "verse": 16
}
```

Validation:

- `book_code`: requis, string
- `chapter`: requis, integer
- `verse`: requis, integer

Response 200:

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "book_code": "JHN",
    "chapter": 3,
    "verse": 16,
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:00:00.000000Z"
  }
}
```

### DELETE /api/v1/bible-bookmarks/{bookmark}

Supprimer un signet biblique.

Auth requise: oui

Response 200:

```json
{
  "message": "Bookmark removed"
}
```

## Preference Settings

### GET /api/v1/preference-settings

Retourne les preferences utilisateur.

Auth requise: oui

Response 200 si des preferences existent:

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "preferred_version": "LSG",
    "theme": "light",
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:00:00.000000Z"
  }
}
```

Response 200 si aucune preference n'existe:

```json
{
  "data": null
}
```

### PATCH /api/v1/preference-settings

Creer ou mettre a jour les preferences utilisateur.

Auth requise: oui

Request body:

```json
{
  "preferred_version": "LSG",
  "theme": "dark"
}
```

Validation:

- `preferred_version`: optionnel, string ou null
- `theme`: optionnel, string ou null

Comportement:

- Si aucune preference n'existe, l'endpoint cree l'entite.
- Si une preference existe deja, l'endpoint la met a jour.
- Au niveau base de donnees, les valeurs par defaut sont `LSG` et `light`.

Response 200:

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "preferred_version": "LSG",
    "theme": "dark",
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:05:00.000000Z"
  }
}
```

## Lesson Progress Entries

### GET /api/v1/lesson-progress-entries

Liste les progressions de lecons de l'utilisateur connecte.

Auth requise: oui

Response 200:

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "lesson_id": "uuid",
      "created_at": "2026-03-19T15:00:00.000000Z",
      "updated_at": "2026-03-19T15:00:00.000000Z"
    }
  ]
}
```

### POST /api/v1/lesson-progress-entries

Creer ou reutiliser une entree de progression pour une lecon.

Auth requise: oui

Request body attendu par le controleur:

```json
{
  "lesson_id": 12
}
```

Validation dans le controleur:

- `lesson_id`: requis, integer

Comportement dans le code:

- L'endpoint appelle `updateOrCreate(['lesson_id' => $data['lesson_id']])` sur la relation utilisateur.
- Cela signifie qu'une meme lecon ne devrait exister qu'une seule fois par utilisateur au niveau logique applicatif.

Response 200:

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "lesson_id": "uuid-or-value-passed",
    "created_at": "2026-03-19T15:00:00.000000Z",
    "updated_at": "2026-03-19T15:00:00.000000Z"
  }
}
```

Important:

- Il existe une incoherence entre validation et schema SQL.
- Le controleur valide `lesson_id` comme `integer`.
- La migration declare `lesson_id` comme `foreignUuid`.
- Pour un autre projet, il faut clarifier si `lesson_id` doit etre un UUID ou un entier avant d'integrer ce contrat tel quel.

## Modeles et formats de donnees

### User

Structure de sortie:

```json
{
  "id": "uuid",
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "role": "admin | editor | user",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

Champs persistants:

- `id`: uuid, cle primaire
- `name`: string
- `email`: string unique
- `email_verified_at`: timestamp nullable
- `password`: string hash
- `role`: string indexe, valeurs possibles `admin`, `editor`, `user`
- `remember_token`: string nullable
- `created_at`: timestamp
- `updated_at`: timestamp

### BibleNote

Structure de sortie:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "book_code": "JHN",
  "chapter": 3,
  "verse": 16,
  "text": "Texte de la note",
  "is_public": false,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

Champs persistants:

- `id`: uuid, cle primaire
- `user_id`: uuid, FK vers `users.id`
- `book_code`: string
- `chapter`: integer
- `verse`: integer
- `text`: text
- `is_public`: boolean, defaut `false`
- `created_at`: timestamp
- `updated_at`: timestamp

### BibleBookmark

Structure de sortie:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "book_code": "JHN",
  "chapter": 3,
  "verse": 16,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

Champs persistants:

- `id`: uuid, cle primaire
- `user_id`: uuid, FK vers `users.id`
- `book_code`: string
- `chapter`: integer
- `verse`: integer
- `created_at`: timestamp
- `updated_at`: timestamp

### UserPreferenceSettings

Structure de sortie:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "preferred_version": "LSG",
  "theme": "light",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

Champs persistants:

- `id`: uuid, cle primaire
- `user_id`: uuid, FK vers `users.id`
- `preferred_version`: string, defaut `LSG`
- `theme`: string, defaut `light`
- `created_at`: timestamp
- `updated_at`: timestamp

### LessonProgressEntry

Structure de sortie:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "lesson_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

Champs persistants:

- `id`: uuid, cle primaire
- `user_id`: uuid, FK vers `users.id`
- `lesson_id`: uuid en base de donnees, mais valide comme integer dans le controleur
- `created_at`: timestamp
- `updated_at`: timestamp

## Resume rapide des routes

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/register` | non | Inscription |
| POST | `/api/v1/login` | non | Connexion |
| GET | `/api/v1/me` | oui | Profil courant |
| POST | `/api/v1/logout` | oui | Deconnexion |
| PUT | `/api/v1/profile` | oui | Mettre a jour le profil |
| POST | `/api/v1/profile/delete-account` | oui | Supprimer le compte |
| GET | `/api/v1/bible-notes` | oui | Lister les notes |
| POST | `/api/v1/bible-notes` | oui | Creer une note |
| GET | `/api/v1/bible-notes/{note}` | oui | Voir une note |
| PUT/PATCH | `/api/v1/bible-notes/{note}` | oui | Modifier une note |
| DELETE | `/api/v1/bible-notes/{note}` | oui | Supprimer une note |
| GET | `/api/v1/bible-bookmarks` | oui | Lister les signets |
| POST | `/api/v1/bible-bookmarks` | oui | Creer un signet |
| DELETE | `/api/v1/bible-bookmarks/{bookmark}` | oui | Supprimer un signet |
| GET | `/api/v1/preference-settings` | oui | Lire les preferences |
| PATCH | `/api/v1/preference-settings` | oui | Creer ou mettre a jour les preferences |
| GET | `/api/v1/lesson-progress-entries` | oui | Lister la progression |
| POST | `/api/v1/lesson-progress-entries` | oui | Creer ou reutiliser une progression |

## Recommandation pour reutilisation par Copilot

Si ce fichier est importe comme contexte dans un autre projet, Copilot doit considerer que:

- l'API principale est versionnee sous `/api/v1`
- toutes les routes sauf `register` et `login` demandent un token Sanctum
- les identifiants de ressources sont majoritairement des UUID
- les resources Laravel renvoient generalement les objets sous la cle `data`
- `register` et `login` ne suivent pas ce wrapper `data`
- `profile` renvoie un wrapper `data` avec l'utilisateur mis a jour
- `profile/delete-account` renvoie un message simple
- cote Nuxt, ces ressources sont consommees directement via `nuxt-auth-sanctum`; elles ne sont plus remappees par des routes Nitro dediees
- `lesson_id` doit etre reverifie avant implementation cliente a cause de l'incoherence integer versus UUID