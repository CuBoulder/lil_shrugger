# Lil' Shrugger

Atlas was sad and in need of a friend so that's where Lil' Shrugger comes in. He shrugs and is probably full of bugs. What a stinker!!! He will attempt to make querying and updating code via Atlas more user-friendly. 


![Lil' Shrugger Logo](/src/images/lil_shrugger.jpg?raw=true "Lil' Shrugger")

## Getting Started

Once you clone this repository down, you'll have to take a couple of steps to get started.

1. This app can run anywhere, but there is an included `.lando.yml` file for running it using (Lando)[https://docs.devwithlando.io/]

```bash
# Build the app. 
lando start

# For any info about the app you would need.
# Includes URLs to access the app. 
lando info

# General commands.
lando
```
 
2. You will need to configure the application to your use case on the settings page. There you will see several fields you need to enter for making requests to Atlas, setting up where your app is located, and making requests to the GitHub API.  

3. After saving your settings, "index.html", i.e. the "Sites" page, should load with your sites listed in a table assuming "https://inventory.local" is running. You may have to go to "https://inventory.local" and choose to verfiy the SSL cert in order for the listing of sites to show up. 

## Documentation

Documentation for this codebase will [reside in the wiki](https://github.com/CuBoulder/lil_shrugger/wiki).
