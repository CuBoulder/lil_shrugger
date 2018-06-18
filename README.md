# Lil' Shrugger

Lil' Shrugger is [Atlas'](https://github.com/CuBoulder/atlas) best friend. He is a front-end UI application built with Vue.js and used to deploy code to the [Web Express service](https://github.com/CuBoulder/express) as well as generating reports about the sites on the service.

## Getting Started

Once you clone this repository down, you'll have to take a couple of steps to get started.

```bash
# Install dependencies. 
npm install

# Run dev server. 
npm run dev

# Build production code.
# The build files will end up in the "/dist" folder at the root of this repository.
npm run build

# There are a couple of environmental variables you can set to alter the build.
# SUBDIRECTORY is where you want the base path to exist.
# EXT_ENV is where you can specifiy a hosting environment for targeted configurations.
SUBDIRECTORY=shrugger EXT_ENV=pantheon npm run build 
```

## Running Tests 

Running tests will require a couple of manual steps until they are worked into the test runner command. You will need to start up the test API and load the fixture data before running any tests.

The testing documentation resides in the test folder README.md: ...link

## Notes

- You will need to configure the application to your use case on the settings page. There you will see several fields you need to enter for making requests to Atlas, setting up where your app is located, and making requests to the GitHub API.  

- You may have to go to "https://inventory.local" and choose to verfiy the SSL cert in order for the listing of sites to show up on your local development environment. 

## Documentation

Documentation for this codebase will [reside in the wiki](https://github.com/CuBoulder/lil_shrugger/wiki).

