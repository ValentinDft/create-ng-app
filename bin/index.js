#!/usr/bin/env node
'use strict';

const { execSync } = require('node:child_process');
const fs = require('node:fs');

// (en minuscules). Le package est installé depuis GitHub Packages, donc
// ~/.npmrc doit deja etre configure sur la machine (voir README de create-ng-app).
const CONFIG_PKG = '@valentindft/ng-base-config';
const CONFIG_PKG_VERSION_RANGE = '^1.0.0';

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function parseArgs(argv) {
  const [name, ...rest] = argv;
  const opts = { prefix: null };
  for (const arg of rest) {
    if (arg.startsWith('--prefix=')) opts.prefix = arg.split('=')[1];
  }
  if (!opts.prefix) {
    opts.prefix = (name || 'app').replace(/[^a-zA-Z]/g, '').slice(0, 3).toLowerCase() || 'app';
  }
  return { name, ...opts };
}

const { name, prefix } = parseArgs(process.argv.slice(2));

if (!name) {
  console.error('Usage: create-ng-app <nom-app> [--prefix=xxx]');
  console.error('Exemple: create-ng-app nextframe --prefix=ngf');
  process.exit(1);
}

// 1. Scaffold Angular — toujours la dernière version de la CLI.
//    Les prompts restants (SSR, zoneless, etc. selon la version d'Angular)
//    s'affichent normalement, tu y réponds toi meme.
run(`npx -y @angular/cli@latest new ${name} --style=scss --routing`);

process.chdir(name);

// 2. Outils de lint/format/git-hooks + la config partagée (GitHub Packages)
run(
  `npm install -D ${CONFIG_PKG}@${CONFIG_PKG_VERSION_RANGE} eslint @eslint/js typescript-eslint angular-eslint prettier husky lint-staged`,
);

// 3. eslint.config.js -- appelle la factory partagée avec le prefix du projet
fs.writeFileSync(
  'eslint.config.js',
  `// @ts-check
const buildConfig = require('${CONFIG_PKG}/eslint');

module.exports = buildConfig({ prefix: '${prefix}' });
`,
);

// 4. Branchement prettier / lint-staged / scripts dans package.json
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.prettier = `${CONFIG_PKG}/prettier`;
pkg['lint-staged'] = `${CONFIG_PKG}/lint-staged`;
pkg.scripts = {
  ...pkg.scripts,
  lint: 'eslint .',
  format: 'prettier --write .',
};
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// 5. tsconfig.json — étend la base partagée en plus de ce que ng new a généré
const tsconfigPath = 'tsconfig.json';
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
const existingExtends = tsconfig.extends
  ? [].concat(tsconfig.extends)
  : [];
tsconfig.extends = [...existingExtends, `${CONFIG_PKG}/tsconfig/base.json`];
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');

// 6. Husky
run('npx husky init');
fs.writeFileSync('.husky/pre-commit', 'npx lint-staged\n');

// 7. Commit de la base
run('git add -A');
run('git commit -m "chore: scaffold via create-ng-app (eslint/prettier/ts/husky communs)"');

console.log(
  `\n${name} est prêt : Angular dernière version + ESLint/Prettier/TS partages + Husky configures.\n`,
);
