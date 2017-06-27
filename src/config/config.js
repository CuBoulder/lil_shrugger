/**
 * @file
 * Contains data used in other places.
 */
let siteConfig = {};

/**
 * The select options can be used in the listing component for when the data/options
 * are known. To make this work, the keys, e.g "status, code_type", map to the columns
 * in the listing table. The keys also have to be listed in the editKeys as well
 * as the selectKeys properties.
 */
siteConfig['selectOptions'] = {
  status: ['available', 'installed', 'launching'],
  type: ['module', 'core', 'profile'],
};
