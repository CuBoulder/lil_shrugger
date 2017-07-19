# Lil' Shrugger

Atlas was sad and in need of a friend so that's where Lil' Shrugger comes in. He shrugs and is probably full of bugs. What a stinker!!! He will attempt to make querying and updating code via Atlas more user-friendly. 


![Lil' Shrugger Logo](/src/images/lil_shrugger.jpg?raw=true "Lil' Shrugger")

## Getting Started

Once you clone this repository down, you'll have to take a couple of steps to get started.

1. This app can run anywhere, but to add it to http://express.local, you'll need to clone the lil_shrugger and create a symlink.

```
cd ~/express_local/data/code
git clone git@github.com:CuBoulder/lil_shrugger.git
ssh express.local
cd /data/web/express
ln -s /data/code/lil_shrugger shrugger
```

Now you should be able to access this app at http://express.local/shrugger/settings.html. 

2. You will need to configure the application to your use case on the settings page. There you will see several fields you need to enter for making requests to Atlas, setting up where your app is located, and making requests to the GitHub API.  

3. After saving your settings, the page needs to be refreshed to load the baseURL you just entered. After refreshing the page, "index.html", i.e. the "Sites" page, should load with your sites listed in a table assuming "https://inventory.local" is running. You may have to go to "https://inventory.local" and choose to verfiy the SSL cert in order for the listing of sites to show up. 

## App Structure 
```
- src
|- config
|- css
|- images
|- js
|- partials
index.html
```
### Src

This directory contains the assets needed to build the application. Other than the site config, routes, and page HTML files, every other file should be placed in this directory. 

- **Config** - Here you can find JS files you'll probably want to configure for your local environment. 
- **CSS** - Like you would think, you put CSS files in here. In the future SASS could be used to compile these into one file.
The CSS files should be semantic in that I can know what CSS they contain by reading the file name. For instance, the "env-dropdown.css" file corresponds to the environment selector located in the navbar. 
- **Images** - Here you would place any images that are needed for the application. 
- **JS** - This folder contains all of the JS that isn't related to site configuration. Each partial will have a corresponding JS file that contains the logic used to generate the partial. 
- **Partials** - These are HTML files that contain parts of a page, e.g. the navbar. Typically, the Vue components will have their templates as partials that are then used in root-level page HTML files. 

### Root-level Files

At the root of the application, we have the HTML files used for navigation. In the future, there will probably only be one HTML file, "index.html", that acts as a front controller and the body of the page would be loaded and swtiched via AJAX. For now, it is simpler just to have a separate HTML file per path/route. 

- **index.html** - Homepage of the app which currently maps to a listing of site records.
- **code.html** - A List of code assets with the ability to update, delete, or add new code assets. 
- **update-sites.html** - A way to query sites for code assets and add/remove packages to the query results. 
- **settings.html** - User credentials for talking to other applications or services. 

Not listed here, but inside "vue-examples.html" are several examples that come from the Vue documentation on how to create different types of components. It is left in the repo for reference, but it will be deleted later when we have a better grasp of how to use Vue. 

## Troubleshooting

- **I can't see sites or code in the tables** - It is possible that the environment indicator, located in the top right of the screen, has not sent a value to other parts of the app trying to make calls to Atlas based on the environment. If you toggle between environments, e.g. local => dev => local, you should see sites/code coming up, if this was the issue. It is also possible that you need to visit "https://inventory.local/" in order to accept the self-signed SSL cert. After a certain timeframe, Chrome will forget that you've approved it and block the application's requests to Atlas. 

- **I made an update to a site/code asset and nothing happened** - There could be many reasons that your update failed, but one of the most common is that one part of your update is not allowed, e.g. you entered the wrong commit hash or code already exists with the same repo and commit hash. Also, the etag could have changed. If you refresh the page, you should get an up-to-date etag for the code/site asset and be able to send your update successfully. 

## Reading List

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Vue](https://vuejs.org/)
- [Bootstrap](http://getbootstrap.com/css/)
- [HTML Imports](https://www.html5rocks.com/en/tutorials/webcomponents/imports/)
- [ES6 Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [A Vue.js Autocomplete Component](http://taha-sh.com/blog/building-an-awesome-reusable-autocomplete-input-component-in-vue-21-part-one)


