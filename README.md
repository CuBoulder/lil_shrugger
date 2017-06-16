# Lil' Shrugger

Atlas was sad and in need of a friend so that's where Lil' Shrugger comes in. He shrugs and is probably full of bugs. What a stinker!!! He will attempt to make querying and updating code via Atlas more user-friendly. 


![Lil' Shrugger Logo](/src/images/lil_shrugger.jpg?raw=true "Lil' Shrugger")

## Getting Started

Once you clone this repository down, you'll have to take a couple of steps to get started. Currently, you can only test this UI with "https://inventory.local".

1. You will need to add headers to the Atlas code until https://github.com/CuBoulder/atlas/pull/267/files is reviewed and merged in.  To do this...

```
cd ~/express_local/data/code/atlas
git fetch --all
git checkout feature/266
ssh inventory.local
restartatlas
```

2. This app can run anywhere, but to add it to http://express.local, you'll need to clone the lil_shrgger and create a symlink.

```
cd ~/express_local/data/code
git clone git@github.com:CuBoulder/lil_shrugger.git
ssh express.local
cd /data/web/express
ln -s /express_local/data/code/lil_shrugger vue
```

Now you should be able to access this at http://express.local/vue

3. You will need to configure "config.js" to your use case. First you need to copy "src/config/config.example.js" into "src/config/config.js". This is done to ignore your local config while keep a copy with default examples and comments. For instance, I have my site locally at "localhost/vue" where the docroot is in the "/vue" subdirectory. For "baseURL", I then need to add "/vue" for the menu to work. 

```
let siteConfig = {
  baseURL: '/vue',
  username: 'yourIdentikey',
  password: 'yourPassword',
  host: 'http://yourUrl/',
  postman_token: 'from-postman-authorization-piece'
};
```
4. Now, the root "index.html" should load with your sites listed in a table. Assuming "https://inventory.local" is running, you've approved the lack of verified SSL cert for the https connection in the browser you are using and there are site records.

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
- **status.html** - Eventually will contain an overview of statuses relating to Atlas. 

Then there are other HTML files for pages. For instance, the "status.html" page is intended to list a quick check of the status of things like Apache, Celery, etc. that we can use when starting to debug an issue. "code.html" will be added in the future to list out code assets. 

Inside "vue-examples.html" are several examples that come from the Vue documentation on how to create different types of components. It is left in the repo for reference, but it will be deleted later when we have a better grasp of how to use Vue. 

## Next Steps

This is a very intial version of the code. The "edit" button on the "index.html" page listing is planned to pop out more information where you can enter data into text fields, select boxes, etc. and then that to be updated. 

## JS Nonsense Used

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Vue](https://vuejs.org/)
- [Bootstrap](http://getbootstrap.com/css/)
- [HTML Imports](https://www.html5rocks.com/en/tutorials/webcomponents/imports/)
- [ES6 Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)


