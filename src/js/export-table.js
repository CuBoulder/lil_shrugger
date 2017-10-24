/**
 *
 * Make an array of objects formatted for CSV export.
 *
 * @param objArray
 * @returns {string}
 */
function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line !== '') line += ',';
      line += array[i][index];
    }
    str += line + '\r\n';
  }

  return str;
}

/**
 * Export formatted JSON to CSV.
 *
 * @param headers
 * @param items
 * @param fileTitle
 */
function exportCSVFile(headers, items, fileTitle) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to CSV format.
  const jsonObject = JSON.stringify(items);
  const csv = this.convertToCSV(jsonObject);

  const exportedFilename = fileTitle + '.csv' || 'export.csv';
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});

  downloadFile(blob, exportedFilename);
}

/**
 * Export a string of data to a text file.
 *
 * @param data
 * @param fileTitle
 *
 * @returns {null}
 */
function exportTextFile(data, fileTitle) {

  const exportedFilename = fileTitle + '.txt' || 'export.txt';
  const blob = new Blob([data], {type: 'text/plain;charset=utf-8;'});

  downloadFile(blob, exportedFilename);
}

/**
 * Download a file blob via the browser.
 *
 * @param data
 * @param fileName
 *
 * @returns {null}
 */
function downloadFile(data, fileName) {

  if (navigator.msSaveBlob) {
    // IE 10+.
    navigator.msSaveBlob(data, fileName);
    return null;
  }

  const link = document.createElement("a");
  if (link.download !== undefined) {
    // Feature detection for Browsers that support HTML5 download attribute.
    const url = URL.createObjectURL(data);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
