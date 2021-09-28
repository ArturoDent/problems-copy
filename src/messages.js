const vscode = require('vscode');

/**
 * Build a string indicating which options were included in the keybinding: errors, warnings, etc.
 * 
 * @param {Object} args - from keybindings
 * @returns {String} filter
 */
exports.severityFilter = function (args) {
  
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
 * @param {String} severityFilter - filter out errors, etc. by severity
 * @returns {Array<vscode.Diagnostic>} filteredArray
 */
exports.filterBySeverity  = function (diagnostics, severityFilter) {

  let filteredArray = diagnostics;

  if (!severityFilter.includes("Errors")) filteredArray = filteredArray.filter( problem => problem.severity !== 0 );
  if (!severityFilter.includes("Warnings")) filteredArray = filteredArray.filter( problem => problem.severity !== 1 );
  if (!severityFilter.includes("Informations")) filteredArray = filteredArray.filter( problem => problem.severity !== 2 );
  if (!severityFilter.includes("Hints")) filteredArray = filteredArray.filter(problem => problem.severity !== 3);

  return filteredArray;
}

/**
 * Remove from the diagnostics array those whose messages or relatedInformation[0].message do not include the message text filter.
 * @param {Array<vscode.Diagnostic>} diagnostics 
 * @param {String} messageFilter - filter out not including text
 * @returns {Array<vscode.Diagnostic>} filteredArray
 */
exports.filterByMessage  = function (diagnostics, messageFilter) {

  if (!messageFilter) return diagnostics;
  let regex;

  // /declared/i
  const filterRegex = new RegExp(/^\/?(?<body>.*?)\/?(?<flags>[gmi]*)$/m);

  const reduce = messageFilter.match(filterRegex);
  
  // if no flags, make it case-insensitive like vscode's built-in message filter
  if (reduce.groups?.body) regex = new RegExp(reduce.groups.body, reduce.groups.flags || "i");

  return diagnostics.filter(problem => {

    if (!problem.relatedInformation) return regex.test(problem.message);
    
    else {                                                         // problem.relatedInformation[]
      if (regex.test(problem.message)) return true;
      for (const relatedInfoItem of problem.relatedInformation) {  // loop
        return regex.test(relatedInfoItem.message);
      }
    }
  });
}

/**
 * Remove from the diagnostics array any files not requested
 * @param {Array<vscode.Diagnostic>} diagnostics 
 * @param {String} fileFilter - filter out files not in fileFilter
 * @returns {Array<vscode.Diagnostic>} filteredArray
 */
exports.filterByFile  = function (diagnostics, fileFilter) {

  if (!fileFilter) return diagnostics;

  let filteredArray = diagnostics;

  // loop if multiple, comma-separated values
  // if (!fileFilter.includes("Errors")) filteredArray = filteredArray.filter( problem => problem.resouce );

  return filteredArray;
}

/**
 * Parse the values from a single vscode.Diagnostic
 * 
 * @param {String} path - file path from Diagnostic[0]
 * @param {Object} details - entires from Diagnostic[1]
 * @returns {Object} obj - copy Diagnostic values to our Object
 */
exports.parseFullMessage = function (path, details) {
  
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

/**
 * Parse the values from a single vscode.Diagnostic into a compactMode string message
 * 
 * @param {String} path - file path from Diagnostic[0]
 * @param {Object} details - entires from Diagnostic[1]
 * @param {String} template - simple template form to use
 * @returns {String} obj - copy Diagnostic values to our Object
 */
exports.buildTemplateMessage = function (path, details, template) {

  // path, message, source(code), [lineNumber:column]

  let compactMessage = template;
  let { code, severity, message, source, relatedInformation } = details;

  compactMessage = compactMessage.replace(/\${severity}/g, _getSeverity);
  function _getSeverity() {
    if (severity === 0) return "Error";
    else if (severity === 1) return "Warning";
    else if (severity === 2) return "Information";
    else if (severity === 3) return "Hint";
  }

  compactMessage = compactMessage.replace(/\${path}/g, vscode.workspace.asRelativePath(path));
  compactMessage = compactMessage.replace(/\${message}/g, message);
  compactMessage = compactMessage.replace(/\${source}/g, source);

  compactMessage = compactMessage.replace(/\${code}/g, _getCode);
  function _getCode() {
    if (typeof code === "object") return code.value;
    else if (typeof code === "number") return String(code);
    else if (code === undefined) return "";
  }

  compactMessage = compactMessage.replace(/\${startLine}/g, details.range.start.line + 1);
  compactMessage = compactMessage.replace(/\${startCol}/g, details.range.start.character + 1);
  compactMessage = compactMessage.replace(/\${endLine}/g, details.range.end.line + 1);
  compactMessage = compactMessage.replace(/\${endCol}/g, details.range.end.character + 1);

  let newline = "";

  if (compactMessage.endsWith("\\n")) {
    newline = "\n";
    compactMessage = compactMessage.substring(0, compactMessage.length - 2);
  }

  if (relatedInformation) {      // if length > 1: loop
    
    for (const relatedInfoItem of relatedInformation) {

      let { location, message } = relatedInfoItem;
      compactMessage += `\n\t\t${ vscode.workspace.asRelativePath(location.uri.path) } :  ${ message }  `;
      compactMessage += `[${ location.range.start.line + 1 }:`;
      compactMessage += `${ location.range.start.character + 1 }]`;
    }
  }

  compactMessage += `${ newline }`;

  compactMessage = compactMessage.replace(/\\n/g, "\n");
  compactMessage = compactMessage.replace(/\\t/g, "\t");
  return `${compactMessage}\n`;
}