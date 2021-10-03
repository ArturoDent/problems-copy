/**
 * Get just the problems-copy args keys, like "errors", "warnings", etc.
 * @returns {Array}
 */
exports.getKeys = function () {
  return ["errors", "warnings", "hints", "informations", "messageFilter", "fileFilter", "simpleTemplate"];
}

/**
 * Get just the problems-copy args entries, like errors: [true, false].
 * @returns {Object}
 */
exports.getValues = function () {
	return {
    errors: [true, false], warnings: [true, false], hints: [true, false],
    informations: [true, false], messageFilter: "", fileFilter: "", simpleTemplate: [true, false]
	};
}

/**
 * Get just the problems-copy args priorities, for ordering in suggestions.
 * @returns {Object}
 */
exports.getPriorities = function () {
	return {
    errors: "01", warnings: "02", hints: "03", informations: "04",
    messageFilter: "04", fileFilter: "05", simpleTemplate: "06"
	};
}

/**
 * Get just the problems-copy args descriptions, for suggestions.
 * @returns {Object}
 */
exports.getDescriptions = function () {
	return {
    errors: "Show all Errors.",
    warnings: "Show all Warnings.",
    hints: "Show all Hints.",
    informations: "Show all Informations.",
    messageFilter: "Filter messages for specified text string.",
    fileFilter: "Filter files - globs allowed, e.g., `**/*.js`.",
    simpleTemplate: "True = use your simpleTemplate."
	};
}

/**
 * Get the default values for all problems-copy keys
 * @returns {Object} - {"errors": true, "warnings": true}
 */
exports.getDefaults = function () {
	return {
		"errors": "true",
		"warnings": "true",
		"hints": "true",
    "informations": "true",
    "simpleTemplate": "false"
	};
};

/**
 * Get the default template.
 * @returns {String} - the default template
 */
exports.getDefaultTemplate = function () {
  return "${severity}, ${path}, \"${message}\", ${source}(${code}), [${startLine}:${startCol}]";
}