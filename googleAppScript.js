// This code lives inside the Google Spreadsheet

function updateSpreadsheet() {
    var sheet = SpreadsheetApp.getActiveSheet();
    var count = parseInt(PropertiesService.getScriptProperties().getProperties().i) + 1;
    PropertiesService.getScriptProperties().setProperty('i',count + '');
    sheet.getRange('a1').setValue(count);
  }
  
  function createTimeDrivenTriggers() {
    // Trigger every 1 minute.
    PropertiesService.getScriptProperties().setProperty('i','0');
    ScriptApp.newTrigger('updateSpreadsheet')
        .timeBased()
        .everyHours(1)
        .create();
  }