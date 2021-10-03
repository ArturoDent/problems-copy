const vscode = require('vscode');

/**
 * Show a notification that copying done with number of problems.  
 * @param {Number} numProblemsCopied 
 * @param {String} fileName - empty for copyAll
 */
exports.showNumProblems = function (numProblemsCopied, fileName) {

  let message = "";
  if (fileName) message = `'${ fileName }' : ${ numProblemsCopied } problem(s) copied to the clipboard.`;
  else message = `${numProblemsCopied} problem(s) copied to the clipboard.`;

  vscode.window
    .showInformationMessage(`${ message }`,
      ...['Okay'])   // one button
    .then(selected => {
      if (selected === 'Okay') vscode.commands.executeCommand('leaveEditorMessage');
    });
};


/**
 * Show a notification that no problems found (after filtering or there weren't any) occurred.  
 * @param {String} errorMessage 
 */
exports.showError = function (errorMessage) {

  vscode.window
    .showInformationMessage(`${ errorMessage }`,
      ...['Okay'])   // one button
    .then(selected => {
      if (selected === 'Okay') vscode.commands.executeCommand('leaveEditorMessage');
    });
}