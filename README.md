# create-ng-app

CLI personnel pour scaffolder un nouveau projet Angular avec la dernière version d'Angular CLI + toute la config qualité commune (`@valentindft/ng-base-config`) branchée d'emblée.

---

## Pourquoi ce CLI existe

`ng new` génère un projet Angular vierge. Il faut ensuite installer et brancher ESLint, Prettier, Stylelint, TypeScript strict, Husky et lint-staged — à la main, à chaque nouveau projet. Ce CLI automatise ces étapes en une seule commande et garantit que tous les projets partent du même socle.

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
        ├─ 2. npm install -D ng-base-config + eslint + prettier + husky + lint-staged + stylelint
        │
        ├─ 3. Génère eslint.config.mjs  ──────────► @valentindft/ng-base-config/eslint
        │
        ├─ 4. Modifie package.json
        │       ├── prettier  ───────────────────► @valentindft/ng-base-config/prettier
        │       └── scripts: lint, format
        │
        ├─ 4bis. Génère lint-staged.config.cjs ──► @valentindft/ng-base-config/lint-staged
        │
        ├─ 4ter. Génère stylelint.config.cjs ────► @valentindft/ng-base-config/stylelint
        │
        ├─ 5. Modifie tsconfig.json extends ─────► @valentindft/ng-base-config/tsconfig/base.json
        │
        ├─ 5bis. Crée src/app/core/ shared/ features/
        │
        ├─ 6. Crée .nvmrc (Node 22)
        │
        ├─ 7. Crée .github/workflows/ci.yml (lint + test sur push/PR)
        │
        ├─ 8. npx husky init + hook pre-commit → npx lint-staged
        │             └── hook pre-push → npm test
        │
        └─ 9. git commit initial
```

---

## Prérequis

### Node.js & Angular CLI

Node.js 22 recommandé. Le CLI utilise `npx @angular/cli@latest` à la volée — pas besoin d'installer `@angular/cli` globalement.

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
├── .nvmrc                         ← Node 22 (lu par nvm, Vercel, Netlify, CI)
├── .github/
│   └── workflows/
│       └── ci.yml                 ← lint + test sur chaque push/PR vers main
├── eslint.config.mjs              ← factory ng-base-config/eslint avec le prefix
├── stylelint.config.cjs           ← pointe vers ng-base-config/stylelint
├── lint-staged.config.cjs         ← pointe vers ng-base-config/lint-staged
├── tsconfig.json                  ← extends ng-base-config/tsconfig/base.json
├── package.json
│   ├── prettier                   → "@valentindft/ng-base-config/prettier"
│   └── scripts
│       ├── lint                   → "eslint ."
│       └── format                 → "prettier --write ."
├── .husky/
│   ├── pre-commit                 → "npx lint-staged"
│   └── pre-push                   → "npm test --watch=false --browsers=ChromeHeadless"
└── src/app/
    ├── core/                      ← guards, interceptors, services globaux
    ├── shared/                    ← components/pipes/directives réutilisables
    └── features/                  ← modules fonctionnels
```

### Stack commune à tous les projets générés

- **Angular** (dernière version) — standalone components, zoneless, Signals, `input()`/`output()`, `@if`/`@for`
- **SCSS + BEM** — Stylelint enforce `block__element--modifier`
- **TypeScript strict** — `strict: true` + `noImplicitOverride`, `noImplicitReturns`, `exactOptionalPropertyTypes`, `strictTemplates`
- **ESLint flat config** — `@eslint/js` + `typescript-eslint` + `angular-eslint`, règles type-aware activées
- **Prettier** — `singleQuote`, `trailingComma: all`, `printWidth: 100`, parser `angular` pour les HTML
- **Stylelint** — `stylelint-config-standard-scss` + convention BEM
- **Husky + lint-staged** — pre-commit : eslint/stylelint/prettier sur les fichiers stagés ; pre-push : tests
- **GitHub Actions CI** — lint + test sur chaque push sur `main` et chaque PR
- **Supabase** — à installer manuellement selon le projet (PostgreSQL + Auth + RLS)
- **Déploiement** — Vercel ou Netlify (lisent `.nvmrc` automatiquement)

---

## Détail des étapes

### 1. `ng new`
```bash
ng new <nom> --style=scss --routing
```
Utilise toujours la dernière version de `@angular/cli`. Les prompts interactifs d'Angular (SSR, zoneless, etc.) s'affichent normalement.

### 2. Installation des dépendances
```bash
npm install -D @valentindft/ng-base-config@^1.0.0 \
  eslint @eslint/js typescript-eslint angular-eslint \
  prettier husky lint-staged \
  stylelint stylelint-config-standard-scss
```

### 3. `eslint.config.mjs`
Génère une flat config ESLint pointant vers la factory du package partagé avec le prefix du projet. Les règles type-aware (`no-floating-promises`, `await-thenable`) sont activées via `parserOptions.project: true`.

### 4. `package.json`
- Branche `prettier` sur la config partagée.
- Ajoute les scripts `lint` et `format`.

### 4bis. `lint-staged.config.cjs`
Fichier dédié plutôt qu'inline dans `package.json` car `package.json` ne supporte pas les références de packages externes pour `lint-staged`.

### 4ter. `stylelint.config.cjs`
Pointe vers `@valentindft/ng-base-config/stylelint` — enforce BEM sur tous les fichiers SCSS.

### 5. `tsconfig.json`
Ajoute `@valentindft/ng-base-config/tsconfig/base.json` dans le tableau `extends` existant — les options Angular générées par `ng new` sont conservées.

### 5bis. Structure de dossiers
Crée `src/app/core/`, `src/app/shared/` et `src/app/features/` avec un `.gitkeep` chacun.

### 6. `.nvmrc`
Fixe la version Node à `22`. Lu automatiquement par `nvm use`, Vercel, Netlify et le workflow CI.

### 7. `.github/workflows/ci.yml`
Pipeline GitHub Actions déclenché sur chaque push vers `main` et chaque PR :
1. Checkout du code
2. Setup Node 22 (via `.nvmrc`) + cache npm
3. `npm ci`
4. `npm run lint`
5. `npm test --watch=false --browsers=ChromeHeadless`

Le CI est le filet de sécurité côté GitHub — il garantit que le code pushé est propre indépendamment de la machine locale. Gratuit sur les repos privés dans la limite de 2 000 min/mois (GitHub Free).

### 8. Husky
`npx husky init` initialise Husky, puis :
- `pre-commit` → `npx lint-staged` (lint + format des fichiers stagés)
- `pre-push` → `npm test` en mode headless (bloque le push si les tests cassent)

### 9. Commit initial
```bash
git add -A
git commit -m "chore: scaffold via create-ng-app (eslint/prettier/ts/husky communs)"
```