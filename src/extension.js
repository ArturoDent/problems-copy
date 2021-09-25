const vscode = require('vscode');
const messages = require('./messages');
const provider = require('./completionProviders');


/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

  provider.makeKeybindingsCompletionProvider(context);

	let disposable = vscode.commands.registerCommand('problems-copy.copyAll', async function (args) {

    // const diagObject = [];
    // let index = 0;
    let filter = "";
    let simpleTemplate = "";

    let diagnostics = vscode.languages.getDiagnostics();

    // check for empty args and no args key at all: from Command Palette or keybinding
    // default = all of them: "Errors+Warnings+Informations+Hints"
    if (diagnostics.length && args && Object.entries(args).length) {
      filter = messages.filterSeverity(args);
    }
    else filter = "Errors+Warnings+Informations+Hints";  // default

    if (diagnostics.length) diagnostics = diagnostics.filter(diagnostic => diagnostic[1].length > 0);
    let message = "";

    const useTemplate = await vscode.workspace.getConfiguration().get('problems-copy.useSimpleTemplate');
    if (useTemplate) simpleTemplate = await vscode.workspace.getConfiguration().get('problems-copy.simpleTemplate');

    for (const diagnostic of diagnostics) {
        
      // let parsed = {};
      let filteredArray = messages.filterArray(diagnostic[1], filter); 
      
      for (const problem of filteredArray) {
        // parsed = _parseMessage(diagnostic[0].path, problem);
        // diagObject[index++] = parsed;
        message += messages.buildTemplateMessage(diagnostic[0].path, problem, simpleTemplate);

      }
    }
    // await vscode.env.clipboard.writeText(JSON.stringify(diagObject, null, '\t'));
    await vscode.env.clipboard.writeText(message);

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
      filter = messages.filterSeverity(args);
    }
    else filter = "Errors+Warnings+Informations+Hints";

    let parsed = {};
    let filteredArray = messages.filterArray(diagnostics, filter); 
    
    for (const problem of filteredArray) {
      parsed = messages.parseFullMessage(uri.path, problem);
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


