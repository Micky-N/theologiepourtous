# Contrat Laravel -> Nuxt Server pour la synchronisation du contenu

## Objectif

Laravel est la source de verite des themes et des lessons.
Lorsqu'un theme ou une lesson est cree, modifie, publie, deplace, depublie ou supprime, Laravel envoie un evenement HTTP au serveur Nuxt.
Le serveur Nuxt traduit ensuite cet evenement en fichiers dans `content/2.enseignements`.

## Rappel de structure cible

### Theme

Un theme correspond a un dossier :

```text
content/2.enseignements/{position}.{theme-slug}/index.yml
```

Exemple :

```text
content/2.enseignements/3.christologie/index.yml
```

### Lesson

Une lesson correspond uniquement a un fichier markdown :

```text
content/2.enseignements/{theme-position}.{theme-slug}/{lesson-position}.{lesson-slug}.md
```

Exemple :

```text
content/2.enseignements/3.christologie/1.deite-christ.md
```

Il n'y a pas de fichier YAML dedie pour les lessons.
Toute la metadata de lesson est dans le frontmatter du fichier markdown.

## Endpoint Nuxt cible

Laravel envoie les notifications vers un endpoint interne Nuxt :

```http
POST /api/internal/content-sync
```

Nuxt doit accepter un seul endpoint de synchronisation, puis router selon `event`.

## Headers recommandes

```http
Content-Type: application/json
X-Content-Sync-Key: <shared-secret>
X-Content-Sync-Timestamp: <iso-8601>
X-Content-Sync-Signature: <hmac-sha256-du-body>
X-Content-Sync-Event: <event-name>
```

## Evenements a supporter

Quatre evenements suffisent :

- `theme.upsert`
- `theme.delete`
- `lesson.upsert`
- `lesson.delete`

## Regles metier

- `theme.upsert` cree ou met a jour le fichier `index.yml` du theme.
- `theme.delete` supprime le dossier du theme.
- `lesson.upsert` cree ou met a jour le fichier markdown de la lesson.
- `lesson.delete` supprime le fichier markdown de la lesson.
- Une lesson non publiee ne doit pas exister dans `content/2.enseignements`.
- Une lesson depubliee doit etre envoyee en `lesson.delete`.
- Si le slug d'une lesson change, Laravel doit envoyer `previous.slug`.
- Si le theme d'une lesson change, Laravel doit envoyer `previous.theme_slug`.
- Si le slug d'un theme change, Laravel doit envoyer `previous.slug`.

## Schema de payload commun

```json
{
  "event": "lesson.upsert",
  "entity": "lesson",
  "entity_id": "550e8400-e29b-41d4-a716-446655440000",
  "occurred_at": "2026-03-20T10:30:00Z",
  "data": {},
  "previous": {}
}
```

### Champs

- `event` : type d'evenement
- `entity` : `theme` ou `lesson`
- `entity_id` : UUID Laravel de la ressource
- `occurred_at` : date ISO 8601 de l'evenement
- `data` : donnees courantes a ecrire
- `previous` : anciennes donnees utiles pour renommer, deplacer ou supprimer

## Contrat `theme.upsert`

```json
{
  "event": "theme.upsert",
  "entity": "theme",
  "entity_id": "2b617f24-4f1d-4e37-b4df-c0d0d843f14a",
  "occurred_at": "2026-03-20T10:30:00Z",
  "data": {
    "id": "2b617f24-4f1d-4e37-b4df-c0d0d843f14a",
    "title": "Christologie",
    "slug": "christologie",
    "position": 3,
    "description": "La christologie est la branche de la theologie qui etudie la personne et l'oeuvre de Jesus-Christ.",
    "color": "info",
    "image": {
      "src": "/images/themes/christologie.jpg"
    },
    "seo": {
      "description": "La christologie est la branche de la theologie qui etudie la personne et l'oeuvre de Jesus-Christ.",
      "url": "https://theologiepourtous.fr/enseignements/christologie",
      "card": "summary_large_image",
      "keywords": "christologie, Jesus, theologie, Bible",
      "robots": "index, follow",
      "lang": "fr"
    }
  },
  "previous": {
    "slug": "ancienne-christologie",
    "position": 2
  }
}
```

### Utilisation cote Nuxt

Nuxt doit produire ou mettre a jour :

```text
content/2.enseignements/3.christologie/index.yml
```

Le contenu genere doit ressembler a :

```yml
title: Christologie
slug: christologie
description: "La christologie est la branche de la theologie qui etudie la personne et l'oeuvre de Jesus-Christ."
color: info
image:
  src: /images/themes/christologie.jpg
seo:
  description: "La christologie est la branche de la theologie qui etudie la personne et l'oeuvre de Jesus-Christ."
  card: summary_large_image
  keywords: christologie, Jesus, theologie, Bible
  robots: index, follow
  url: https://theologiepourtous.fr/enseignements/christologie
  lang: fr
```

## Contrat `theme.delete`

```json
{
  "event": "theme.delete",
  "entity": "theme",
  "entity_id": "2b617f24-4f1d-4e37-b4df-c0d0d843f14a",
  "occurred_at": "2026-03-20T10:35:00Z",
  "data": {
    "id": "2b617f24-4f1d-4e37-b4df-c0d0d843f14a",
    "slug": "christologie",
    "position": 3
  },
  "previous": {}
}
```

### Utilisation cote Nuxt

Nuxt supprime :

```text
content/2.enseignements/3.christologie
```

## Contrat `lesson.upsert`

```json
{
  "event": "lesson.upsert",
  "entity": "lesson",
  "entity_id": "7a5b211b-f9f8-4d3a-a212-0e40031c6b70",
  "occurred_at": "2026-03-20T10:40:00Z",
  "data": {
    "id": "7a5b211b-f9f8-4d3a-a212-0e40031c6b70",
    "title": "La divinite du Christ : Fils eternel, vrai Dieu",
    "slug": "deite-christ",
    "position": 1,
    "description": "Fondements bibliques et implications de la pleine divinite de Jesus-Christ.",
    "tags": [
      "christologie",
      "divinite de Christ",
      "trinitaire"
    ],
    "reading_time": 9,
    "theme": {
      "id": "2b617f24-4f1d-4e37-b4df-c0d0d843f14a",
      "slug": "christologie",
      "position": 3,
      "title": "Christologie"
    },
    "image": {
      "src": "https://placehold.co/1200x630?text=Divinite+du+Christ"
    },
    "date": "2025-10-03",
    "biblical_references": [
      "Jean 1:1-3",
      "Colossiens 1:15-20"
    ],
    "seo": {
      "description": "Jesus est Dieu veritable: prologue de Jean, hymne de Colossiens, adoration et oeuvres divines.",
      "url": "https://theologiepourtous.fr/enseignements/christologie/deite-christ",
      "card": "summary_large_image",
      "keywords": "divinite de Jesus, Jean 1, Colossiens 1, adorations",
      "robots": "index, follow",
      "lang": "fr"
    },
    "body": "::theological-definition\n---\ndefinition: \"Jesus-Christ, Fils eternel, partage pleinement l'essence divine avec le Pere et l'Esprit.\"\n---\n::\n\n## Introduction\n\nConfesser Jesus comme Seigneur, c'est reconnaitre sa pleine divinite."
  },
  "previous": {
    "slug": "ancienne-lecon",
    "theme_slug": "ancienne-theme",
    "position": 4,
    "theme_position": 2
  }
}
```

### Utilisation cote Nuxt

Nuxt doit produire ou mettre a jour :

```text
content/2.enseignements/3.christologie/1.deite-christ.md
```

Le contenu genere doit ressembler a :

```md
---
title: "La divinite du Christ : Fils eternel, vrai Dieu"
slug: deite-christ
description: "Fondements bibliques et implications de la pleine divinite de Jesus-Christ."
tags: ["christologie", "divinite de Christ", "trinitaire"]
reading_time: 9
theme: christologie
image:
  src: https://placehold.co/1200x630?text=Divinite+du+Christ
date: 2025-10-03
biblical_references:
  - "Jean 1:1-3"
  - "Colossiens 1:15-20"
seo:
  description: "Jesus est Dieu veritable: prologue de Jean, hymne de Colossiens, adoration et oeuvres divines."
  url: "https://theologiepourtous.fr/enseignements/christologie/deite-christ"
  card: "summary_large_image"
  robots: "index, follow"
  keywords: "divinite de Jesus, Jean 1, Colossiens 1, adorations"
  lang: fr
---

::theological-definition
---
definition: "Jesus-Christ, Fils eternel, partage pleinement l'essence divine avec le Pere et l'Esprit."
---
::

## Introduction

Confesser Jesus comme Seigneur, c'est reconnaitre sa pleine divinite.
```

## Contrat `lesson.delete`

```json
{
  "event": "lesson.delete",
  "entity": "lesson",
  "entity_id": "7a5b211b-f9f8-4d3a-a212-0e40031c6b70",
  "occurred_at": "2026-03-20T10:45:00Z",
  "data": {
    "id": "7a5b211b-f9f8-4d3a-a212-0e40031c6b70",
    "slug": "deite-christ",
    "position": 1,
    "theme_slug": "christologie",
    "theme_position": 3
  },
  "previous": {}
}
```

### Utilisation cote Nuxt

Nuxt supprime :

```text
content/2.enseignements/3.christologie/1.deite-christ.md
```

## Cas particuliers a couvrir

### 1. Lesson non publiee

Si une lesson n'est pas publique, Laravel ne doit pas envoyer `lesson.upsert`.
Deux options possibles :

- ne rien envoyer si elle n'a jamais ete synchronisee
- envoyer `lesson.delete` si elle etait deja synchronisee puis depubliee

Je recommande la deuxieme option.

### 2. Changement de slug

Si le slug change, Laravel envoie :

```json
"previous": {
  "slug": "ancien-slug"
}
```

Nuxt peut alors supprimer l'ancien fichier avant d'ecrire le nouveau.

### 3. Changement de theme

Si une lesson change de theme, Laravel envoie :

```json
"previous": {
  "theme_slug": "ancien-theme",
  "theme_position": 2
}
```

Nuxt peut alors supprimer l'ancien fichier dans l'ancien dossier puis ecrire le nouveau dans le nouveau dossier.

### 4. Changement de position

Si la position d'un theme ou d'une lesson change, Laravel doit envoyer la position precedente dans `previous`.
Nuxt pourra supprimer l'ancien chemin numerote puis recreer le nouveau.

## Recommandations backend Laravel

- Envoyer ces evenements depuis des jobs de queue.
- Signer le body avec HMAC SHA-256.
- Faire les envois seulement apres commit base de donnees.
- Toujours inclure `previous` lors d'un update si le slug, le theme ou la position changent.
- Convertir les champs texte Laravel en structure Nuxt avant envoi.

## Champs Laravel a fiabiliser avant implementation

Pour que ce contrat reste propre, Laravel devrait exposer clairement :

- `position` sur `themes`
- `position` sur `lessons`
- `tags` sous forme de tableau logique
- `biblical_references` sous forme de tableau logique
- `published_at` pour determiner si une lesson doit exister dans Nuxt

## Decision sur le format base de donnees

Pour `tags` et `biblical_references`, le format canonique recommande cote Laravel est un tableau JSON natif.

### Stockage recommande

- colonne `tags` de type `json`
- colonne `biblical_references` de type `json`

### Exemple en base

```json
{
  "tags": ["christologie", "divinite de Christ", "trinitaire"],
  "biblical_references": ["Jean 1:1-3", "Colossiens 1:15-20"]
}
```

### Pourquoi ce choix

- correspond exactement au schema attendu par Nuxt Content
- evite les conversions fragiles depuis une chaine CSV
- simplifie les casts Eloquent
- simplifie la serialisation du payload Laravel vers Nuxt
- evite les problemes de virgules dans les valeurs

### Mapping Eloquent recommande

Les modeles Laravel devront caster ces champs en tableau :

```php
protected function casts(): array
{
    return [
        'tags' => 'array',
        'biblical_references' => 'array',
        'published_at' => 'datetime',
        'position' => 'integer',
    ];
}
```

### Validation HTTP recommandee

Lorsqu'on fera plus tard les controllers CMS Laravel, la validation devra suivre ce format :

```php
'tags' => ['nullable', 'array'],
'tags.*' => ['string', 'max:255'],
'biblical_references' => ['nullable', 'array'],
'biblical_references.*' => ['string', 'max:255'],
```

### Regle de normalisation

Avant envoi vers Nuxt, Laravel devra normaliser :

- `tags: null` vers `[]`
- `biblical_references: null` vers `[]`
- suppression des valeurs vides
- trim de chaque entree
- suppression des doublons tout en gardant l'ordre

### Strategie de migration depuis l'existant

Actuellement, les colonnes sont en `text`.
La migration recommandee est :

1. ajouter des colonnes temporaires JSON ou convertir directement si le moteur le permet
2. convertir les valeurs existantes
3. appliquer les casts Eloquent
4. mettre a jour la validation
5. n'emettre vers Nuxt que des tableaux deja normalises

Si aucune donnee utile n'est encore en production, le plus simple sera de remplacer directement les colonnes `text` par des colonnes `json`.

## Decision recommandee

Le payload Laravel doit deja etre pret a ecrire.
Nuxt ne doit pas reconstruire de logique metier complexe.
Son travail doit etre :

- verifier la signature
- router selon `event`
- calculer le chemin cible
- supprimer l'ancien chemin si necessaire
- ecrire ou supprimer les fichiers
