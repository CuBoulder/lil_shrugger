/**
 * Variables used in code that are user configurable.
 *
 * baseURL - Depending on your Apache/web server setup, you might need to set a base URL
 *   for the navigation to work, e.g. "/vue". Add a begging slash.
 *
 * username/password - Your credentials that will be used to perform write operations
 *   with Atlas.
 *
 * host - The place where you sites live, e.g. https://express.local.
 *
 * gitHub - Need to make a token and use your username to not hit rate limit for GitHub API.
 *
 * @type {string}
 */
let siteConfig = {
  baseURL: '',
  username: '',
  password: '',
  host: '',
  gitHub: {
    username: '',
    token: '',
  }
};

/**
 * The select options can be used in the listing component for when the data/options 
 * are known. To make this work, the keys, e.g "status, code_type", map to the columns
 * in the listing table. The keys also have to be listed in the editKeys as well 
 * as the selectKeys properties. 
 */
siteConfig['selectOptions'] = {
  status: ['available', 'installed', 'launching'],
  code_type: ['core', 'profile', 'module'],
};
