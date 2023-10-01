function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('CSV Importer')
    .addItem('Open Sidebar', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  var html= HtmlService.createHtmlOutputFromFile('SideBar')
      .setTitle('CSV Importer');
  var ui =SpreadsheetApp.getUi();
  ui.showSidebar(html);

}

function convertToCsv(data){
  try{

  return Utilities.parseCsv(data);
  }
  catch (error){
    return 'Error: ' + error.message;
  }
}

function uploadCSV(data, selectedColumns, filterCriteriaValues, isNewSheet) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;

    if (isNewSheet) {
      sheet = ss.insertSheet();
    } else {
      sheet = ss.getActiveSheet();
    }

    const csvData = convertToCsv(data);
    const filteredData = [];

    // Batch size for processing
    const batchSize = 1000;
    const numRows = csvData.length;

    // Process the CSV data in batches
    for (let startRow = 0; startRow < numRows; startRow += batchSize) {
      const endRow = Math.min(startRow + batchSize, numRows);
      const batchData = csvData.slice(startRow, endRow);

      for (const row of batchData) {
        let shouldInclude = true;
        const filteredRow = [];

        for (let i = 0; i < selectedColumns.length; i++) {
          const columnIndex = selectedColumns[i];
          const filterCriteria = filterCriteriaValues[columnIndex];

          if (!filter(row[columnIndex], filterCriteria)) {
            shouldInclude = false;
            break;
          }

          filteredRow.push(row[columnIndex]);
        }

        if (shouldInclude) {
          filteredData.push(filteredRow);
        }
      }

      // Use setValues to update the sheet in batches
      sheet.getRange(startRow + 1, 1, filteredData.length, filteredData[0].length).setValues(filteredData);
    }

    return 'CSV data imported successfully!';
  } catch (error) {
    return 'Error: ' + error.message;
  }
}


// function uploadCSV(data,selectedColumns,filterCriteriaValues,isNewSheet) {
//   try {
//     var ss = SpreadsheetApp.getActiveSpreadsheet();
//     var sheet;
//     if (isNewSheet){
//       sheet = ss.insertSheet();
//     }
//     else{
//       sheet = ss.getActiveSheet();
//     }

//     const csvData=convertToCsv(data);

//     const filteredData = [];
//     // Iterate over rows in the CSV data
//     for (const row of csvData) {
//       let shouldInclude = true;
//       const filteredRow = [];

//       // Iterate over selected columns
//       for (let i = 0; i < selectedColumns.length; i++) {
//         const columnIndex = selectedColumns[i];
//         const filterCriteria = filterCriteriaValues[columnIndex];

//         Logger.log(filterCriteria);

//         // Checking the filterCriteria
//         if(!filter(row[columnIndex],filterCriteria)){
//           shouldInclude = false;
//           break;

//         }

//         // // Check if the filterCriteria is a valid number
//         // const filterValue = parseFloat(filterCriteria);

        
//         // if (!isNaN(filterValue)) {
//         //   // Perform numeric comparison (greater than)
//         //   const cellValue = parseFloat(row[columnIndex]);

//         //   if (isNaN(cellValue) || cellValue <= filterValue) {
//         //     shouldInclude = false;
//         //     break; // No need to check other columns for this row
//         //   }
//         // } else {
//         //   // Perform text-based search
//         //   if (row[columnIndex].toLowerCase().indexOf(filterCriteria.toLowerCase()) === -1) {
//         //     shouldInclude = false;
//         //     break; // No need to check other columns for this row
//         //   }
//         // }
//         filteredRow.push(row[columnIndex]);
        
//       }
//       // If the row matches the filter criteria for all selected columns, add it to the filtered data
//       if (shouldInclude) {
//         filteredData.push(filteredRow);
//       }
//     }

//     sheet.getRange(1, 1, filteredData.length, filteredData[0].length).setValues(filteredData);

//     return 'CSV data imported successfully!';
//   } catch (error) {
//     return 'Error: ' + error.message;
//   }
// }

function filter(cellValue,filterCriteria){

  if (!filterCriteria){
    return true;
  }
  if(filterCriteria[0]=="~"){
    if(cellValue){
      return true;
    }
    return false;
  }
  const filterCriteriaValue=filterCriteria.slice(1);
  if (filterCriteriaValue){
    if(filterCriteria[0]=="="){
      if(cellValue==filterCriteriaValue){
        return true;
      }
      return false;
    }
    else if(filterCriteria[0]==">"){
      const filterValueFloat = parseFloat(filterCriteriaValue);
      if (isNaN(filterValueFloat)){
        if(cellValue>filterCriteriaValue){
          return true;
        }
      }
      else{
        const cellValueFloat = parseFloat(cellValue);
        if(!isNaN(cellValueFloat) && cellValueFloat>filterCriteriaValue){
          return true
        }
      }
      return false;
    }

    else if(filterCriteria[0]=="<"){
      const filterValueFloat = parseFloat(filterCriteriaValue);
      if (isNaN(filterValueFloat)){
        if(cellValue<filterCriteriaValue){
          return true;
        }
      }
      else{
        const cellValueFloat = parseFloat(cellValue);
        if(!isNaN(cellValueFloat) && cellValueFloat<filterCriteriaValue){
          return true
        }
      }
      return false;
    }
    else{
      throw new Error('Invalid Filter');
    }
  }
  
  throw new Error('Invalid Filter');

}