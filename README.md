# create-ng-app

CLI personnel pour scaffolder un nouveau projet Angular avec la dernière version d'Angular CLI + toute la config qualité commune (`@valentindft/ng-base-config`) branchée d'emblée.

---

## Pourquoi ce CLI existe

`ng new` génère un projet Angular vierge. Il faut ensuite installer et brancher ESLint, Prettier, TypeScript strict, Husky et lint-staged — à la main, à chaque nouveau projet. Ce CLI automatise ces 7 étapes en une seule commande et garantit que tous les projets partent du même socle.

---

## Architecture

Ce CLI est l'un des deux composants du toolkit perso :

```
angular-base-toolkit/
├── ng-base-config/     ← package npm privé — contient toute la config partagée
└── create-ng-app/      ← CE CLI — orchestre ng new + branchement de ng-base-config
```

Flux d'exécution :

```
npx create-ng-app <nom> --prefix=<xxx>
        │
        ├─ 1. ng new <nom> --style=scss --routing
        │
        ├─ 2. npm install -D ng-base-config + eslint + prettier + husky + lint-staged
        │
        ├─ 3. Génère eslint.config.mjs  ──────────► @valentindft/ng-base-config/eslint
        │
        ├─ 4. Modifie package.json
        │       ├── prettier  ───────────────────► @valentindft/ng-base-config/prettier
        │       ├── lint-staged ─────────────────► @valentindft/ng-base-config/lint-staged
        │       └── scripts: lint, format
        │
        ├─ 5. Modifie tsconfig.json extends ─────► @valentindft/ng-base-config/tsconfig/base.json
        │
        ├─ 6. npx husky init + hook pre-commit → npx lint-staged
        │
        └─ 7. git commit initial
```

---

## Prérequis

### Node.js & Angular CLI

Node.js 20+ recommandé. Le CLI utilise `npx @angular/cli@latest` à la volée — pas besoin d'installer `@angular/cli` globalement.

### Accès à GitHub Packages (`ng-base-config` est un package privé)

Configurer `~/.npmrc` une fois par machine :

```
@valentindft:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<PAT avec scope read:packages>
```

Génère le PAT sur **GitHub → Settings → Developer settings → Personal access tokens** avec la permission `read:packages`.

---

## Utilisation

```bash
npx https://github.com/ValentinDft/create-ng-app <nom-app> --prefix=<prefix>
```

### Arguments

| Argument | Obligatoire | Description |
|----------|-------------|-------------|
| `<nom-app>` | oui | Nom du dossier et du projet Angular |
| `--prefix=<xxx>` | non | Prefix des sélecteurs de composants/directives (ex: `ngf`, `mgr`). Si omis, déduit des 3 premières lettres du nom. |

### Exemples

```bash
npx https://github.com/ValentinDft/create-ng-app nextframe --prefix=ngf
npx https://github.com/ValentinDft/create-ng-app mongarage --prefix=mgr
```

### Alias recommandé (`.zshrc` / `.bashrc`)

```bash
alias create-ng-app='npx https://github.com/ValentinDft/create-ng-app'
```

Puis :

```bash
create-ng-app nextframe --prefix=ngf
```

---

## Ce que le CLI génère

Après exécution, le projet a cette structure (en plus du scaffold Angular standard) :

```
<nom-app>/
├── eslint.config.mjs          ← factory ng-base-config/eslint avec le prefix
├── tsconfig.json              ← extends ng-base-config/tsconfig/base.json
├── package.json
│   ├── prettier               → "@valentindft/ng-base-config/prettier"
│   ├── lint-staged            → "@valentindft/ng-base-config/lint-staged"
│   └── scripts
│       ├── lint               → "eslint ."
│       └── format             → "prettier --write ."
└── .husky/
    └── pre-commit             → "npx lint-staged"
```

### Stack commune à tous les projets générés

- **Angular** (dernière version) — standalone components, zoneless, Signals, `input()`/`output()`, `@if`/`@for`
- **SCSS + BEM** — pas de Tailwind
- **TypeScript strict** — `strict: true` + `noImplicitOverride`, `noImplicitReturns`, `strictTemplates`
- **ESLint flat config** — `@eslint/js` + `typescript-eslint` + `angular-eslint`
- **Prettier** — `singleQuote`, `trailingComma: all`, `printWidth: 100`, parser `angular` pour les HTML
- **Husky + lint-staged** — pre-commit : eslint --fix + prettier --write sur les fichiers stagés
- **Supabase** — à installer manuellement selon le projet (PostgreSQL + Auth + RLS)
- **Déploiement** — Vercel ou Netlify

---

## Détail des 7 étapes

### 1. `ng new`
```bash
ng new <nom> --style=scss --routing
```
Utilise toujours la dernière version de `@angular/cli`. Les prompts interactifs d'Angular (SSR, etc.) s'affichent normalement.

### 2. Installation des dépendances
```bash
npm install -D @valentindft/ng-base-config@^1.0.0 \
  eslint @eslint/js typescript-eslint angular-eslint \
  prettier husky lint-staged
```

### 3. `eslint.config.mjs`
Génère une flat config ESLint pointant vers la factory du package partagé avec le prefix du projet.

### 4. `package.json`
- Branche `prettier` et `lint-staged` sur les configs partagées.
- Ajoute les scripts `lint` et `format`.

### 5. `tsconfig.json`
Ajoute `@valentindft/ng-base-config/tsconfig/base.json` dans le tableau `extends` existant — les options Angular générées par `ng new` sont conservées.

### 6. Husky
`npx husky init` initialise Husky, puis le hook `pre-commit` est remplacé par `npx lint-staged`.

### 7. Commit initial
```bash
git add -A
git commit -m "chore: scaffold via create-ng-app (eslint/prettier/ts/husky communs)"
```
