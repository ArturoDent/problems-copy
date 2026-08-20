const assert = require('assert');
const vscode = require('vscode');

const messages = require('../../src/messages');

/**
 * @param {String|Number|{value: (String|Number), target: vscode.Uri}|undefined} code
 * @returns {vscode.Diagnostic}
 */
function makeDiagnostic(code) {
  const range = new vscode.Range(0, 0, 0, 5);
  const diagnostic = new vscode.Diagnostic(range, 'test message', vscode.DiagnosticSeverity.Warning);
  diagnostic.source = 'Sigasi';
  diagnostic.code = code;
  return diagnostic;
}

suite('buildTemplateMessage ${code} macro', () => {

  // diagnostic.code as a plain string (e.g. Sigasi's numeric codes: "3", "130")
  test('string code', () => {
    const details = makeDiagnostic('130');
    const result = messages.buildTemplateMessage('test.sv', details, '${source}: "${code}"');
    assert.equal(result, 'Sigasi: "130"\n');
  });

  test('number code', () => {
    const details = makeDiagnostic(42);
    const result = messages.buildTemplateMessage('test.js', details, '${source}(${code})');
    assert.equal(result, 'Sigasi(42)\n');
  });

  // diagnostic.code as { value, target } (e.g. eslint)
  test('object code with value', () => {
    const details = makeDiagnostic({ value: 'no-unused-vars', target: vscode.Uri.file('test.js') });
    const result = messages.buildTemplateMessage('test.js', details, '${source}(${code})');
    assert.equal(result, 'Sigasi(no-unused-vars)\n');
  });

  test('undefined code', () => {
    const details = makeDiagnostic(undefined);
    const result = messages.buildTemplateMessage('test.js', details, '${source}(${code})');
    assert.equal(result, 'Sigasi()\n');
  });
});
