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

Running tests will require a couple of manual steps until they are worked into the test runner command. You will need to start up the test API and load the fixture data before running any tests. The testing documentation is being developed currently and will reside in the wiki. For now, you can look to the [active PR for fixing automated testing](https://github.com/CuBoulder/lil_shrugger/pull/373/files#diff-c30ff793110b0960f76bb3854af6f5a8R1) to find out more.

## Notes

- You will need to configure the application to your use case on the settings page. There you will see several fields you need to enter for making requests to Atlas, setting up where your app is located, and making requests to the GitHub API.  

- You may have to go to "https://inventory.local" and choose to verfiy the SSL cert in order for the listing of sites to show up on your local development environment. 

## Documentation

Documentation for this codebase will [reside in the wiki](https://github.com/CuBoulder/lil_shrugger/wiki). It is a work in progress at the moment but contains stubs for all the parts of the application. Please help fill it in as you develop :) 

## Updating Ultimate Shrugger

There is a publically accessible version of Lil' Shrugger located at http://ultimate-shrugger-8.pantheonsite.io/shrugger/. That version is so users who cant use NPM can still read data and export reports. 

To update that version:

1. Gain access to the Pantheon "Shrugger 8" project from a team member.

2a. Pre-relases steps. Run the tests locally. If they don't pass, then fix the dang bugs before you continue.

2b. You should look in the `src/vuex/pantheon.js` file and see if anything needs changed in there. The variable changes only apply to the other non-ultimate Shrugger URLs and don't effect http://ultimate-shrugger-8.pantheonsite.io/shrugger/. If you need to change those, make the change in that file and at the bottom section of `src/vuex/store.js`.

2c. Tag a release like you normally would in GitHub for this project. You will need to up the versions in `src/vuex/store.js` before you do that. Look for `shruggerVersion` and `shruggerLatestRelease`. This feature allows users to see if they need to pull code from the dev branch or update to a new tag if they didn't hear or know about a new release.

3. Run `SUBDIRECTORY=shrugger EXT_ENV=pantheon npm run build ` locally in the root of this project to make a build in the `dist/` folder. You can delete any files in that directory before you start the build process.

4. Delete the `static` and `index.html` files in the `shrugger/` subdirectory of the Pantheon site repo.

5. Copy over the files in `dist/` for this project over to the Pantheon Shrugger repo's `/shrugger` directory, e.g. something like `cp -R dist/* ../shrugger-8/shrugger`. You will need to add all the files via Git since they won't be tracked.

6. Comment out the redirect code in `settings.php` in the Pantheon repo. This part is needed in order to clear caches on Pantheon and load the new assets since Pantheon isn't built to host static sites.

```php
// Redirect all requests to /shrugger.
// header('Location: http://'. $_SERVER['HTTP_HOST']. '/shrugger', TRUE, 302);
// exit;
```

7. Add and commit the changes and push to Pantheon.

8. Update the code on all environments clearing the caches afterwards.

9. **Optional**: Add back in the redirect to `/shrugger` since the app is using browser history instead of the hash routing mode. By doing so, going to `http://ultimate-shrugger-8.pantheonsite.io/shrugger/code` still places you into the app instead of giving you a page not found.

```php
// Redirect all requests to /shrugger.
header('Location: http://'. $_SERVER['HTTP_HOST']. '/shrugger', TRUE, 302);
exit;
```

10. Add packaged release files to the GitHub release page. Now that you are sure the release functions as expected, you can upload tar files for each type of Shrugger release. This version has environmental variables set for Pantheon hosting in the build step so you can do something like `tar -cvf ~/Downloads/shrugger_pantheon_0_7.0.tar dist/* ` from the root of this project. Attache the tar files to the GitHub release where it says "attach binaries" at the bottom of the page.

