# lil_shrugger

## 2.x Version

The 2.x branch is in heavy development and is considered to be experimental and unstable for production usage. 
For this reason, it will be deployed in GET-only mode for requests to Atlas. Local development mode will still 
remain restriction free.

Deployed at: ...

## Documentation

Documentation can be found in the wiki: https://github.com/CuBoulder/lil_shrugger/wiki

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build

# There are a couple of environmental variables you can set to alter the build.
#
# SUBDIRECTORY is where you want the base path to exist.
#
# EXT_ENV is where you can specifiy a hosting environment for targeted configurations.
# Supported environments are "netlify" and "pantheon".
EXT_ENV=netlify yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your end-to-end tests
```
yarn run test:e2e
```

### Run your unit tests
```
yarn run test:unit
```
