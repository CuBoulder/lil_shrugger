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

The Atlas URL is replaced for testing via an examination of Node processes. When in "development" mode, 

```js
/* Insert local config here. */
if (process.env.NODE_ENV === 'development') {
  store.state.atlasEnvironments.Local = 'http://localhost:3000/';
}

```

```bash
# Startup API from root of project and load fixture data.
node_modules/.bin/json-server --watch test/fixtures/db.json --id=_id --middlewares test/atlas-middleware.js --routes test/routes.json

# Run the e2e tests using Nightwatch.js.
npm run e2e
```