const vscode = require('vscode');


/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	let disposable = vscode.commands.registerCommand('problems-copy.copyAll', async function (args) {

    const diagObject = [];
    let index = 0;
    let filter = "";

    let diagnostics = vscode.languages.getDiagnostics();

    // check for empty args and no args key at all: from Command Palette or keybinding
    // default = all of them: "Errors+Warnings+Informations+Hints"
    if (diagnostics.length && args && Object.entries(args).length) {
      filter = _filterSeverity(args);
    }
    else filter = "Errors+Warnings+Informations+Hints";  // default

    if (diagnostics.length) diagnostics = diagnostics.filter(diagnostic => diagnostic[1].length > 0);

    for (const diagnostic of diagnostics) {
        
      let parsed = {};
      let filteredArray = _filterArray(diagnostic[1], filter); 
      
      for (const problem of filteredArray) {
        parsed = _parseMessage(diagnostic[0].path, problem);
        diagObject[index++] = parsed;
      }
    }
    await vscode.env.clipboard.writeText(JSON.stringify(diagObject, null, '\t'));
	});
  context.subscriptions.push(disposable);
  
  // ----------------------------------------------------------------------------------------------

  let disposable2 = vscode.commands.registerCommand('problems-copy.copyCurrentFileMessages', async function (args) {

    const uri = vscode.window.activeTextEditor.document.uri;
    const diagObject = [];
    let index = 0;
    let filter = "";

    let diagnostics = vscode.languages.getDiagnostics(uri);
    if (diagnostics.length && args && Object.entries(args).length) {
      filter = _filterSeverity(args);
    }
    else filter = "Errors+Warnings+Informations+Hints";

    let parsed = {};
    let filteredArray = _filterArray(diagnostics, filter); 
    
    for (const problem of filteredArray) {
      parsed = _parseMessage(uri.path, problem);
      diagObject[index++] = parsed;
    }

    await vscode.env.clipboard.writeText(JSON.stringify(diagObject, null, '\t'));
  });
  context.subscriptions.push(disposable2);
}

exports.activate = activate;

// function deactivate() {}

// module.exports = {
// 	activate,
// 	deactivate
// }


/**
 * Build a string indicating which options were included in the keybinding: errors, warnings, etc.
 * 
 * @param {Object} args - from keybindings
 * @returns {String} filter
 */
function _filterSeverity(args) {
  
  let filter = "";

  if (args.errors || args.Errors) filter += "Errors+";
  if (args.warnings || args.Warnings) filter += "Warnings+";
  if (args.informations || args.Informations) filter += "Informations+";
  if (args.hints || args.Hints) filter += "Hints";

  return filter;
}


/**
 * Remove from the diagnostics array any non-requested types, like errors, warnings, etc.
 * @param {Array<vscode.Diagnostic>} diagnostics 
 * @param {String} filters - filter out errors, etc. by severity
 * @returns {Array<vscode.Diagnostic>} filteredArray
 */
function _filterArray(diagnostics, filters) {

  let filteredArray = diagnostics;

  if (!filters.includes("Errors")) filteredArray = filteredArray.filter( problem => problem.severity !== 0 );
  if (!filters.includes("Warnings")) filteredArray = filteredArray.filter( problem => problem.severity !== 1 );
  if (!filters.includes("Informations")) filteredArray = filteredArray.filter( problem => problem.severity !== 2 );
  if (!filters.includes("Hints")) filteredArray = filteredArray.filter(problem => problem.severity !== 3);

  return filteredArray;
}

/**
 * Parse the values from a single vscode.Diagnostic
 * 
 * @param {String} path - file path from Diagnostic[0]
 * @param {Object} details - entires from Diagnostic[1]
 * @returns {Object} obj - copy Diagnostic values to our Object
 */
function _parseMessage(path, details) {
  
  const resource = path;
  const { code, severity, message, source } = details;
  const obj = { resource, code, severity, message, source };
  // obj.resource = path;
  // obj.owner = details.owner;  // not surfaced in the getDiagnostics()
  obj.startLineNumber = details.range.start.line + 1;
  obj.startColumn = details.range.start.character + 1;
  obj.endLineNumber = details.range.end.line + 1;
  obj.endColumn = details.range.end.character + 1;

  if (details.relatedInformation) {                   // if length > 1: loop
    obj.relatedInformation = [];
    let index = 0;

    for (const relatedInfoItem of details.relatedInformation) {
    
      obj.relatedInformation[index] = {};
      const related = relatedInfoItem.location;
      obj.relatedInformation[index].startLineNumber = related.range.start.line + 1;
      obj.relatedInformation[index].startColumn = related.range.start.character + 1;
      obj.relatedInformation[index].endLineNumber = related.range.end.line + 1;
      obj.relatedInformation[index].endColumn = related.range.end.character + 1;
      obj.relatedInformation[index].message = relatedInfoItem.message;
      obj.relatedInformation[index].resource = related.uri.path;
      index++;
    }
  }
  return obj;
}