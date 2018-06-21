# Testing 

Lil' Shrugger uses ... to test things.

## Fixtures

Lil' Shrugger uses a "fake" API to simulate the request/response cycle where Atlas would normally be used. There is less validation in the fake API, but it functions well enough for testing purposes.

To fake Atlas responses, we take current data from Atlas, remove some of the keys, and then commit the aggregate in `db.json`. The site and stats records don't return all the results available, but you can use the `max_results` query parameter to gather more records than the first 500. 

```bash
# Put the individual code records into the fixtures directory.
cd ~/Sites/my-shrugger-directory/test/fixtures

# Get 500 site records.
curl https://osr-atlas03.int.colorado.edu/atlas/site -o sites.json

# Get 1000 site records via "max_results".
curl https://osr-atlas03.int.colorado.edu/atlas/sites?max_results=1000 -o sites.json

# Some URLs need the "-g" option for CURL to work. 
curl 'https://osr-atlas03.int.colorado.edu/atlas/sites?where={"type":"express"}&max_results=2000' -o sites.json -g

```

You should repeat the process for all of the Atlas endpoints listed at: "https://osr-atlas03.int.colorado.edu/atlas/". Each response from Atlas includes metadata that you don't need to include in the JSON Server. In each file, remove the metadata so that you have an array of objects.

```js
// Start of metadata.
{"_items": 

// ...more JSON...

// End of metadata.
, "_links": {"self": {"href": "statistics", "title": "statistics"}, "last": {"href": "statistics?page=2", "title": "last page"}, "parent": {"href": "/", "title": "home"}, "next": {"href": "statistics?page=2", "title": "next page"}}, "_meta": {"max_results": 500, "total": 951, "page": 1}}
```

Go through each of the files you made and delete those parts of the files wrapping the remaining array in a key with the endpoint's name, e.g. `"sites" [ ...stuff... ]`. Now, you need to combine all of the JSON into the `db.json` file wrapped in an object that has the endpoint keys nested inside.

```js
// db.json file
{
  // From sites.json
  "sites": [ ... ],
  // From code.json
  "code": [ ... ],
  // etc...
}
```

Add script to remove sensitive information?

## JSON Server Instance

The Atlas URL is replaced for testing via an examination of Node processes. 

```js
/* Insert local config here. */
if (process.env.NODE_ENV === 'development') {
  store.state.atlasEnvironments.Local = 'http://localhost:3000/';
}

```

When in "development" mode, the "Local" Atlas URL is changed to the default one JSON Server creates when it boots up.
You don't have to do anything to make your "Local" environment work, but note that the local Atlas URL is changed when
you are using `npm run dev` for development and `npm run e2e` for tests.

```bash
# Startup API from root of project and load fixture data.
node_modules/.bin/json-server --watch test/fixtures/db.json --id=_id --middlewares test/atlas-middleware.js --routes test/routes.json

# To reset the state of the database that JSON Server uses, you need to reset db.json, which is checked into version control.
# Since tests change the state of the database, you should run this after each test run while writing tests.
git checkout HEAD -- test/fixtures/db.json 
```

After running that command, you should be able to see data in the DataTable component just as you do for all the other Atlas environments.
Now, you can run the test suite with the commands listed below.

```bash
# Run the e2e tests using Nightwatch.js after reseting the database state.
git checkout HEAD -- test/fixtures/db.json  && npm run e2e

# To get to help text, you need to specify the JS file used.
# "npm run ..." commands don't seem to use flags.
# Run this from the root of the project.
node test/e2e/runner.js --help 
```