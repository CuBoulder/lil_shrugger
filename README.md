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

2. You will need to configure "config.js" to your use case. For instance, I have my site locally at "localhost/vue" where the docroot is in the "/vue" subdirectory. For "baseURL", I then need to add "/vue" for the menu to work. 

```
let siteConfig = {
  baseURL: '/vue',
  username: 'yourIdentikey',
  password: 'yourPassword'
};
```
3. Now, the root "index.html" should load with your sites listed in a table, if you have "https://inventory.local" up and it has site records. 

## Next Steps

This is a very intial version of the code. The "edit" button on the "index.html" page listing is planned to pop out more information where you can enter data into text fields, select boxes, etc. and then that to be updated. 

## JS Nonsense Used

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Vue](https://vuejs.org/)
- [Bootstrap](http://getbootstrap.com/css/)
- [HTML Imports](https://www.html5rocks.com/en/tutorials/webcomponents/imports/)
- [ES6 Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)


