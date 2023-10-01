function Codes() {
  var html= HtmlService.createHtmlOutputFromFile('SideBar')
      .setTitle('CSV Importer');
  var ui =SpreadsheetApp.getUi();
  ui.showSidebar(html);
}
function uploadCSV(csvData, selectedColumns,filterCriteriaValues) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    const filteredData = [];

    // Iterate over rows in the CSV data
    for (const row of csvData) {
      let shouldInclude = true;
      const filteredRow = [];

      // Iterate over selected columns
      for (let i = 0; i < selectedColumns.length; i++) {
        const columnIndex = selectedColumns[i];
        const filterCriteria = filterCriteriaValues[columnIndex];

        // Check if the filterCriteria is a valid number
        const filterValue = parseFloat(filterCriteria);

        
        if (!isNaN(filterValue)) {
          // Perform numeric comparison (greater than)
          const cellValue = parseFloat(row[columnIndex]);

          if (isNaN(cellValue) || cellValue <= filterValue) {
            shouldInclude = false;
            break; // No need to check other columns for this row
          }
        } else {
          // Perform text-based search
          if (row[columnIndex].toLowerCase().indexOf(filterCriteria.toLowerCase()) === -1) {
            shouldInclude = false;
            break; // No need to check other columns for this row
          }
        }
        filteredRow.push(row[columnIndex]);
        
      }
      // If the row matches the filter criteria for all selected columns, add it to the filtered data
      if (shouldInclude) {
        filteredData.push(filteredRow);
      }
    }

    sheet.getRange(1, 1, filteredData.length, filteredData[0].length).setValues(filteredData);

    return 'CSV data imported successfully!';
  } catch (error) {
    return 'Error: ' + error.message;
  }
}

function convertToCsv(data){
  try{
  return csvData = Utilities.parseCsv(data);
  }
  catch (error){
    return 'Error: ' + error.message;
  }
}