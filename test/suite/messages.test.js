const assert = require('assert');

const messages = require('../../src/messages');

suite('buildTemplateMessage ${code} macro', () => {

  const baseDetails = {
    severity: 1,
    message: 'test message',
    source: 'Sigasi',
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } }
  };

  // diagnostic.code as a plain string (e.g. Sigasi's numeric codes: "3", "130")
  test('string code', () => {
    const details = { ...baseDetails, code: '130' };
    const result = messages.buildTemplateMessage('test.sv', details, '${source}: "${code}"');
    assert.strictEqual(result, 'Sigasi: "130"\n');
  });

  test('number code', () => {
    const details = { ...baseDetails, code: 42 };
    const result = messages.buildTemplateMessage('test.js', details, '${source}(${code})');
    assert.strictEqual(result, 'Sigasi(42)\n');
  });

  // diagnostic.code as { value, target } (e.g. eslint)
  test('object code with value', () => {
    const details = { ...baseDetails, code: { value: 'no-unused-vars', target: undefined } };
    const result = messages.buildTemplateMessage('test.js', details, '${source}(${code})');
    assert.strictEqual(result, 'Sigasi(no-unused-vars)\n');
  });

  test('undefined code', () => {
    const details = { ...baseDetails, code: undefined };
    const result = messages.buildTemplateMessage('test.js', details, '${source}(${code})');
    assert.strictEqual(result, 'Sigasi()\n');
  });
});
