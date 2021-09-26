const vscode = require('vscode');
const argsVault = require('./argsVault');
const jsonc = require("jsonc-parser");


/**
 * Register a CompletionItemProvider for keybindings.json
 * @param {vscode.ExtensionContext} context
 */
exports.makeKeybindingsCompletionProvider = function(context) {
    const configCompletionProvider = vscode.languages.registerCompletionItemProvider (
      { pattern: '**/keybindings.json' },
      {
        provideCompletionItems(document, position) {

          const linePrefix = document.lineAt(position).text.substring(0, position.character);
          if (linePrefix.search(/^\s*"$/m) === -1) return undefined;
							
          const rootNode = jsonc.parseTree(document.getText());
          const curLocation = jsonc.getLocation(document.getText(), document.offsetAt(position));
          if (curLocation?.path[1] !== 'args') return undefined;

          const thisConfig = _findConfig(rootNode, document.offsetAt(position));
          const nodeValue = jsonc.getNodeValue(thisConfig);
          const command = nodeValue.command;

          // copyAll || copyCurrentFileMessages
          if (!command?.startsWith("problems-copy")) return undefined;
          
          if (curLocation.isAtPropertyKey) {
            
            const argsNode = thisConfig.children.filter(entry => {
              return entry.children[0].value === "args";
            });

            const argsStartingIndex = argsNode[0].offset;
            const argsLength = argsStartingIndex + argsNode[0].length;

            const argsRange = new vscode.Range(document.positionAt(argsStartingIndex), document.positionAt(argsLength));
            const argsText = document.getText(argsRange);

            const args = argsVault.getKeys();
            return _filterCompletionsItemsNotUsed(args, argsText, position);
          }
          else return undefined;
        }
			},
		'"'       // trigger intellisense/completion
	);
  context.subscriptions.push(configCompletionProvider);
};

/**
 * Get the keybinding where the cursor is located.
 * 
 * @param {Object} rootNode - all parsed confogs in keybindings.json
 * @param {Number} offset - of cursor position
 * @returns {Object} - the node where the cursor is located
 */
function _findConfig(rootNode, offset)  {

  for (const node of rootNode.children) {
    if (node.offset <= offset && (node.offset + node.length > offset))
      return node;
  }
  return undefined;
}

/**
 * From a string input make a CompletionItemKind.Text
 *
 * @param   {String} key
 * @param   {vscode.Range} replaceRange
 * @param   {String|Boolean} defaultValue - default value for this option
 * @param   {String} sortText - sort order of item in completions
 * @param   {String} documentation - markdown description of each item
 * @returns {vscode.CompletionItem} - CompletionItemKind.Text
 */
function _makeCompletionItem(key, replaceRange, defaultValue, sortText, documentation) {

	const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Text);
	item.range = replaceRange;
  if (defaultValue) item.detail = `default: ${ defaultValue }`;
	if (sortText) item.sortText = sortText;
  if (documentation) item.documentation = new vscode.MarkdownString(documentation);
  
	return item;
}

/**
 * Make CompletionItem arrays, eliminate already used option keys found in the args text
 *
 * @param   {String[]} argArray - options for keybindings
 * @param   {String} argsText - text of the 'args' options:  "args": { .... }
 * @param   {vscode.Position} position - cursor position
 * @returns {Array<vscode.CompletionItem>}
 */
function _filterCompletionsItemsNotUsed(argArray, argsText, position) {

  const defaults = argsVault.getDefaults();
	const priorities = argsVault.getPriorities();
	const descriptions = argsVault.getDescriptions();
  
	/** @type { Array<vscode.CompletionItem> } */
	const completionArray = [];

	// account for commented options (in keybindings and settings)
	argArray.forEach(option => {
		if (argsText.search(new RegExp(`^[ \t]*"${option}"`, "gm")) === -1)
      completionArray.push(_makeCompletionItem(option, new vscode.Range(position, position),
        defaults[`${ option }`], priorities[`${ option }`], descriptions[`${ option }`]));
	});
	return completionArray;
}