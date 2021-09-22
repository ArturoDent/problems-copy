# Problems: Copy

Copy to the clipboard the problems shown in the Problems Panel.  These can be filtered in a keybinding.   

You can copy **all** the problems, which is not currently possible in VS Code.  

--------------------

<br/>

## Extension Settings  

This extension contributes the following commands which can be run from the Command Palette or a keybinding:  

* `problems-copy.copyAll`: "Problems: Copy All Problems"  
* `problems-copy.copyCurrentFileMessages`: "Problems: Copy All Problems for the Current File"  

If run from the Command Palette it is not possible to filter the messages, so all Errors, Warnings, Informations and Hints will be included in the output.  

--------------

### Sample Keybindings  

```jsonc
{
  "key": "alt+c",        // whatever keybinding you want
  "command": "problems-copy.copyAll",
  "args": {
    "errors": true,     // will be included in the result
    "warnings": true

    // any category not in the keybinding will be excluded from the result
    // "hints": true
    // "informations": true
  }
}
```

Sample output (on paste):

```jsonc
[
	{
		"resource": "/c:/Users/Mark/folder-operations/extension.js",
		"code": {
			"value": "no-unused-vars",
			"target": {
				"$mid": 1,
				"path": "/docs/rules/no-unused-vars",
				"scheme": "https",
				"authority": "eslint.org"
			}
		},
		"severity": 1,
		"message": "'args' is defined but never used.",
		"source": "eslint",
		"startLineNumber": 32,
		"startColumn": 102,
		"endLineNumber": 32,
		"endColumn": 106
	},
	{
		"resource": "/c:/Users/Mark/folder-operations/extension.js",
		"code": {
			"value": "no-unused-vars",
			"target": {
				"$mid": 1,
				"path": "/docs/rules/no-unused-vars",
				"scheme": "https",
				"authority": "eslint.org"
			}
		},
		"severity": 1,
		"message": "'diagnostics' is assigned a value but never used.",
		"source": "eslint",
		"startLineNumber": 53,
		"startColumn": 10,
		"endLineNumber": 53,
		"endColumn": 21
	}
]
```

This extension  strives to produce the exact output as if you copy a Problem via the context menu.


----------------------------

<br/>  

## TODO

* Add a shortened version: `message lineNumber/column` 
* File issue: Problems Panel context menu  
* File Issue: context to know if/which filters applied in the Problems filter   
* Add output of a csv version  


## Releases

0.0.1 Initial release