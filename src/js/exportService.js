export default {

  /**
   *
   * Make an array of objects formatted for CSV export.
   *
   * @param objArray
   * @returns {string}
   */
  convertToCSV(objArray) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';


    for (let i = 0; i < array.length; i += 1) {
      let line = '';
      Object.keys(array[i]).forEach((index) => {
        if (line !== '') line += ',';
        line += array[i][index];
      });
      str += line + '\r\n';
    }

    return str;
  },

  /**
   * Export formatted JSON to CSV.
   *
   * @param headers
   * @param items
   * @param fileTitle
   */
  exportCSVFile(headers, items, fileTitle) {
    if (headers) {
      items.unshift(headers);
    }

    // Convert Object to CSV format.
    const jsonObject = JSON.stringify(items);
    const csv = this.convertToCSV(jsonObject);

    const exportedFilename = fileTitle + '.csv' || 'export.csv';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    this.downloadFile(blob, exportedFilename);
  },

  /**
   * Export a string of data to a text file.
   *
   * @param data
   * @param fileTitle
   *
   * @returns {null}
   */
  exportTextFile(data, fileTitle) {
    const exportedFilename = fileTitle + '.txt' || 'export.txt';
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8;' });

    this.downloadFile(blob, exportedFilename);
  },

  /**
   * Download a file blob via the browser.
   *
   * @param data
   * @param fileName
   *
   * @returns {null}
   */
  downloadFile(data, fileName) {
    if (navigator.msSaveBlob) {
      // IE 10+.
      navigator.msSaveBlob(data, fileName);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Feature detection for Browsers that support HTML5 download attribute.
        const url = URL.createObjectURL(data);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },
};
