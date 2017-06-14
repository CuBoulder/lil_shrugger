/**
 * Imports Site Listing HTML into DOM of pages using it.
 *
 * @type {Element}
 */
var link = document.querySelector('link[href="src/partials/listing.html"]');
var content = link.import;
var el = content.querySelector('script');
document.querySelector('body').appendChild(el.cloneNode(true));

/**
 * Gets a list of site records based on environment and pass data to template.
 *
 * @param env
 */
function getCodeRecords(env) {
  // Get response of all site records.
  let response = atlasRequest(getAtlasURL(env), 'code');

  // Response is a Promise object so we must resolve it to get the data out.
  response.then(function(data){

    // Add links.
    data = formatCodeData(data._items);

    console.log(data);

    // Place site data in table via site-listing template located in site-listing.html.
    let siteListing = new Vue({
      el: '#code-listing',
      data: {
        searchQuery: '',
        gridColumns: ['id', 'label', 'type', 'hash'],
        gridData: data
      }
    });
  });
}

/**
 * Need to format data for table.
 *
 * @param data
 */
function formatCodeData(data) {
  let formattedData = [];

  data.forEach(function (element, index) {
    console.log(element);
    let item = [];
    item['label'] = element.meta.label;
    item['type'] = element.meta.code_type;
    item['id'] = element._id;
    item['hash'] = element.commit_hash;
    formattedData.push(item);
  });

  return formattedData;
}

/**
 * Creates the list of site records based on the environment. Every time the environment
 * changes via the environment selector, the search will update.
 */
$(document).ready(function () {
  getCodeRecords(document.querySelector('.env-list .selected').innerHTML);
});

