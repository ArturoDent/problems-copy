const vscode = require('vscode');
const argsVault = require('./argsVault');
const messages = require('./messages');
const provider = require('./completionProviders');


/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

  provider.makeKeybindingsCompletionProvider(context);

	let disposable = vscode.commands.registerCommand('problems-copy.copyAll', async function (args) {

    const diagObject = [];
    let index = 0;
    let filter = "";
    let template = "";

    let diagnostics = vscode.languages.getDiagnostics();

    // check for empty args and no args key at all: from Command Palette or keybinding
    // default = all of them: "Errors+Warnings+Informations+Hints"
    if (diagnostics.length && args && Object.entries(args).length) {
      filter = messages.filterSeverity(args);
    }
    else filter = "Errors+Warnings+Informations+Hints";  // default

    if (diagnostics.length) diagnostics = diagnostics.filter(diagnostic => diagnostic[1].length > 0);
    let message = "";

    let useTemplate = await vscode.workspace.getConfiguration().get('problems-copy.useSimpleTemplate');
    useTemplate = useTemplate || args?.simpleTemplate;

    if (useTemplate) template = await vscode.workspace.getConfiguration().get('problems-copy.simpleTemplate');
    if (!template) template = argsVault.getDefaultTemplate();

    for (const diagnostic of diagnostics) {

      let filteredArray = messages.filterArray(diagnostic[1], filter); 
      
      if (useTemplate) {
        for (const problem of filteredArray) {
          message += messages.buildTemplateMessage(diagnostic[0].path, problem, template);
        }
      }
      else {
        for (const problem of filteredArray) {
          let parsed = {};
          parsed = messages.parseFullMessage(diagnostic[0].path, problem);
          diagObject[index++] = parsed;
        }
      }
    }
    if (useTemplate) await vscode.env.clipboard.writeText(message);
    else await vscode.env.clipboard.writeText(JSON.stringify(diagObject, null, '\t'));

	});
  context.subscriptions.push(disposable);
  
  // ----------------------------------------------------------------------------------------------

  let disposable2 = vscode.commands.registerCommand('problems-copy.copyCurrentFileMessages', async function (args) {

    const uri = vscode.window.activeTextEditor.document.uri;
    const diagObject = [];
    let index = 0;
    let filter = "";
    let template = "";

    let useTemplate = await vscode.workspace.getConfiguration().get('problems-copy.useSimpleTemplate');
    useTemplate = useTemplate || args?.simpleTemplate;

    if (useTemplate) template = await vscode.workspace.getConfiguration().get('problems-copy.simpleTemplate');
    if (!template) template = argsVault.getDefaultTemplate();

    let diagnostics = vscode.languages.getDiagnostics(uri);
    if (diagnostics.length && args && Object.entries(args).length) {
      filter = messages.filterSeverity(args);
    }
    else filter = "Errors+Warnings+Informations+Hints";
    let filteredArray = messages.filterArray(diagnostics, filter); 

    let message = "";

    if (useTemplate) {
      for (const problem of filteredArray) {
        message += messages.buildTemplateMessage(uri.path, problem, template);
      }
    }
    else {
      for (const problem of filteredArray) {
        let parsed = {};
        parsed = messages.parseFullMessage(uri.path, problem);
        diagObject[index++] = parsed;
      }
    }
    
    if (useTemplate) await vscode.env.clipboard.writeText(message);
    else await vscode.env.clipboard.writeText(JSON.stringify(diagObject, null, '\t'));
  });
  context.subscriptions.push(disposable2);
}

exports.activate = activate;

// function deactivate() {}

// module.exports = {
// 	activate,
// 	deactivate
// }

