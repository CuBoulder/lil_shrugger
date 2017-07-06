/**
 * @file
 * Contains data used in other places.
 */
let siteConfig = {};

/**
 * These URLs will be used in many places via switching from the navbar.
 *
 * @type {{local: string, dev: string, test: string, prod: string}}
 */
siteConfig['atlasEnvironments'] = {
  Local: 'https://inventory.local/',
  Dev: 'https://osr-atlas01.int.colorado.edu/',
  Test: 'https://osr-atlas02.int.colorado.edu/',
  Prod: 'https://osr-atlas03.int.colorado.edu/'
};

// Need to set default environment.
if (localStorage.getItem('env') === null) {
  localStorage.setItem('env', 'Local');
}

/**
 * These URLs will be used for site links in the listing table.
 *
 * @type {{Local: string, Dev: string, Test: string, Prod: string}}
 */
siteConfig['expressEnvironments'] = {
  Local: 'https://express.local/',
  Dev: 'https://www-dev.colorado.edu/',
  Test: 'https://www-test.colorado.edu/',
  Prod: 'https://www.colorado.edu/'
};

/**
 * The select options can be used in the listing component for when the data/options
 * are known. To make this work, the keys, e.g "status, code_type", map to the columns
 * in the listing table. The keys also have to be listed in the editKeys as well
 * as the selectKeys properties.
 */
siteConfig['selectOptions'] = {
  status: ['available', 'installed', 'launching'],
  code_type: ['module', 'core', 'profile'],
  is_current: [true, false],
};


/**
 * Need to set the default sites search query. The reason for doing this is that
 * the inventory has records off of pool-A and also legacy sites, which we might
 * not care to see.
 */
if (localStorage.getItem('sites-query') === null) {
  localStorage.setItem('sites-query', '?where={"type":"express"}');
}

/**
 * Set the default code query to grab all code assets.
 */
if (localStorage.getItem('code-query') === null) {
  localStorage.setItem('code-query', '');
}
