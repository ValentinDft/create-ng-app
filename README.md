# @valentindft/create-ng-app

CLI perso pour scaffolder un nouveau projet Angular avec toujours la
dernière version d'Angular + la config ESLint/Prettier/TypeScript/Husky
commune à tous mes projets (`@valentindft/ng-base-config`).

## Utilisation

```
npx git+ssh://git@github.com/valentindft/create-ng-app.git nextframe --prefix=ngf
```

(`git+ssh` réutilisé ta cle SSH GitHub deja configurée — pratique si le
repo du CLI est privé. Si le repo est public, tu peux aussi faire
`npx github:valentindft/create-ng-app nextframe --prefix=ngf`.)

Le script :

1. Lance `ng new` avec la dernière CLI Angular (`--style=scss --routing`).
   Les prompts restants d'Angular (SSR, etc.) s'affichent normalement.
2. Installe la config partagée + ESLint/Prettier/Husky/lint-staged.
3. Génère `eslint.config.js` avec le prefix de sélecteur que tu as passé.
4. Branche `prettier` et `lint-staged` dans `package.json`.
5. Étend `tsconfig.json` avec la base stricte partagée.
6. Initialise Husky avec un hook `pre-commit` qui lance `lint-staged`.
7. Commit le résultat.

## Astuce

Pour éviter de retaper l'URL complete à chaque fois, ajoute un alias dans
ton `.zshrc` / `.bashrc` :

```
alias create-ng-app='npx git+ssh://git@github.com/valentindft/create-ng-app.git'
```

Puis simplement :

```
create-ng-app mongarage --prefix=mgr
```
