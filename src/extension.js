const vscode = require('vscode');
// const fastGlob = require('fast-glob');

const messages = require('./messages');
const notify = require('./notify');
const provider = require('./completionProviders');


/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

  provider.makeKeybindingsCompletionProvider(context);

	let disposable = vscode.commands.registerCommand('problems-copy.copyAll', async function (args) {

    const diagObject = [];
    let severityFilter = "Errors+Warnings+Informations+Hints";  // default
    let messageFilter = "";
    let fileFilter = "";   // can be String || String[]

    let diagnostics = vscode.languages.getDiagnostics();
    if (!diagnostics?.length) {
      notify.showError(`There were no problems found.`);
    return;
    }

    // check for empty args and no args key at all: from Command Palette or keybinding
    if (args?.errors || args?.warnings || args?.informations || args?.hints) {
      severityFilter = messages.severityFilter(args);
    }
    messageFilter = args?.messageFilter;
    fileFilter = args?.fileFilter;

    if (diagnostics.length) diagnostics = diagnostics.filter(diagnostic => diagnostic[1].length > 0);
    else {
      notify.showError(`There were no problems found.`);
      return;
    }

    const template = await messages.useTemplate(args?.simpleTemplate);

    if (fileFilter?.length > 0) {
      diagnostics = await messages.getFilteredDiagnosticsCopyAll(fileFilter, diagnostics);
    }
    let message = "";
    let numProblems = 0;

    for (const diagnostic of diagnostics) {

      let filteredArray = messages.filterBySeverity(diagnostic[1], severityFilter);
      if(messageFilter && filteredArray.length) filteredArray = messages.filterByMessage(filteredArray, messageFilter);

      if (template) {
        for (const problem of filteredArray) {
          message += messages.buildTemplateMessage(diagnostic[0].path, problem, template);
          numProblems++;
        }
      }
      else {
        for (const problem of filteredArray) {
          let parsed = {};
          parsed = messages.parseFullMessage(diagnostic[0].path, problem);
          diagObject.push(parsed);
          numProblems++;
        }
      }
    }
    if (template && message) await vscode.env.clipboard.writeText(message);
    else if (diagObject.length) await vscode.env.clipboard.writeText(JSON.stringify(diagObject, null, '\t'));

    notify.showNumProblems(numProblems, "");
	});
  context.subscriptions.push(disposable);
  
  // ----------------------------------------------------------------------------------------------

  let disposable2 = vscode.commands.registerCommand('problems-copy.copyCurrentFileMessages', async function (args) {

    const uri = vscode.window.activeTextEditor.document.uri;
    const fileName = vscode.workspace.asRelativePath(uri.path);

    const diagObject = [];

    let severityFilter = "Errors+Warnings+Informations+Hints";  // default
    let messageFilter = "";
    let fileFilter;   // can be String || String[]

    let diagnostics = vscode.languages.getDiagnostics(uri);
    if (!diagnostics?.length) {
      notify.showError(`There were no problems found for '${fileName}'.`);
      return;
    }

    if (args?.errors || args?.warnings || args?.informations || args?.hints) {
      severityFilter = messages.severityFilter(args);
    }
    messageFilter = args?.messageFilter;
    fileFilter = args?.fileFilter;

    if (fileFilter?.length > 0) {
      diagnostics = await messages.getFilteredDiagnosticsCopyCurrent(fileFilter, diagnostics, uri);
    }
    if (!diagnostics?.length) {
      notify.showError(`There were no problems found for '${fileName}'.`);
      return;
    }
    
    let filteredArray = messages.filterBySeverity(diagnostics, severityFilter);
    filteredArray = messages.filterByMessage(filteredArray, messageFilter);
    if (!diagnostics?.length) {
      notify.showError(`There were no problems found for '${fileName}' after filtering for severity and message content.`);
      return;
    }

    const template = await messages.useTemplate(args?.simpleTemplate);

    let message = "";
    let numProblems = 0;

    if (template) {
      for (const problem of filteredArray) {
        message += messages.buildTemplateMessage(uri.path, problem, template);
        numProblems++;
      }
    }
    else {
      for (const problem of filteredArray) {
        let parsed = {};
        parsed = messages.parseFullMessage(uri.path, problem);
        diagObject.push(parsed);
        numProblems++;
      }
    }
    
    // if (template) await vscode.env.clipboard.writeText(message);
    // else await vscode.env.clipboard.writeText(JSON.stringify(diagObject, null, '\t'));
    if (template && message) await vscode.env.clipboard.writeText(message);
    else if (diagObject.length) await vscode.env.clipboard.writeText(JSON.stringify(diagObject, null, '\t'));

    notify.showNumProblems(numProblems, fileName);
  });
  context.subscriptions.push(disposable2);
}


exports.activate = activate;


// function deactivate() {}

// module.exports = {
// 	activate,
// 	deactivate
// }

