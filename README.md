# Getting Started

Once you clone this repository down, you'll have to take a couple of steps to get started.

```bash
# Install dependencies. 
npm install

# Run dev server. 
npm run dev

# Build production code.
npm run build
```

## Running Tests 

Running tests will require a couple of manual steps until they are worked into the test runner command. You will need to start up the test API and load the fixture data before running any tests.

```bash
# Startup API from root of project and load fixture data.
node_modules/.bin/json-server --watch test/fixtures/db.json --id=_id --host=atlas.testing --middlewares test/atlas-middleware.js --routes test/routes.json

# Run the e2e tests using Nightwatch.js.
npm run e2e
```
## Notes

- You will need to configure the application to your use case on the settings page. There you will see several fields you need to enter for making requests to Atlas, setting up where your app is located, and making requests to the GitHub API.  

- You may have to go to "https://inventory.local" and choose to verfiy the SSL cert in order for the listing of sites to show up on your local development environment. 

## Documentation

Documentation for this codebase will [reside in the wiki](https://github.com/CuBoulder/lil_shrugger/wiki).

