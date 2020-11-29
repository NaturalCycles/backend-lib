## @naturalcycles/backend-lib

> Standard library for building Node.js / Express backend

[![npm](https://img.shields.io/npm/v/@naturalcycles/backend-lib/latest.svg)](https://www.npmjs.com/package/@naturalcycles/backend-lib)
[![min.gz size](https://badgen.net/bundlephobia/minzip/@naturalcycles/backend-lib)](https://bundlephobia.com/result?p=@naturalcycles/backend-lib)
[![Maintainability](https://api.codeclimate.com/v1/badges/c7aa5ef93894ec0246c4/maintainability)](https://codeclimate.com/github/NaturalCycles/backend-lib/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c7aa5ef93894ec0246c4/test_coverage)](https://codeclimate.com/github/NaturalCycles/backend-lib/test_coverage)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Actions](https://github.com/NaturalCycles/backend-lib/workflows/default/badge.svg)](https://github.com/NaturalCycles/backend-lib/actions)

# Features

# DEBUG namespaces

- `backend-lib`
- `backend-lib:sentry`

# Exports

- `/` root
- `/deploy`
  - yargs
  - nodejs-lib/fs
  - js-yaml
  - simple-git
  - got
- `/testing`
  - got
- `/db`
  - HttpDB (got)

# Packaging

- `engines.node`: latest Node.js LTS
- `main: dist/index.js`: commonjs, es2019
- `types: dist/index.d.ts`: typescript types
- `/src` folder with source `*.ts` files included
