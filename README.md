# Lil' Shrugger

Atlas was sad and in need of a friend so that's where Lil' Shrugger comes in. He shrugs and is probably full of bugs. What a stinker!!! He will attempt to make querying and updating code via Atlas more user-friendly. 


![Lil' Shrugger Logo](/src/images/lil_shrugger.jpg?raw=true "Lil' Shrugger")

## Getting Started

Once you clone this repository down, you'll have to take a couple of steps to get started. Currently, you can only test this UI with "https://inventory.local".

1. You will need to add headers to the Atlas code and restart Atlas until https://github.com/CuBoulder/atlas/pull/267/files is merged in.
2. The URLs in "navbar.html" will need changed...I had "/vue" after my web root, so I added that. A future update will correct this. 
2. Once you change that, the "settings.html" page will need to saved with your Identikey credentials. These creds are being saved via in-browser local storage. 
3. Now, the root "index.html" should load with your sites listed in a table. 

## Next Steps

This is a very intial version of the code. The "edit" button on the "index.html" page listing is planned to pop out more information where you can enter data into text fields, select boxes, etc. and then that to be updated. 

## JS Nonsense Used

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Vue](https://vuejs.org/)
- [Bootstrap](http://getbootstrap.com/css/)
- [HTML Imports](https://www.html5rocks.com/en/tutorials/webcomponents/imports/)
- [ES6 Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)


