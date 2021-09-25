/**
 * Get just the problems-copy args keys, like "errors", "warnings", etc.
 * @returns {Array}
 */
exports.getKeys = function () {
  return ["errors", "warnings", "hints", "informations"];
}

/**
 * Get just the problems-copy args entries, like errors: [true, false].
 * @returns {Object}
 */
exports.getValues = function () {
	return {
		errors: [true, false], warnings: [true, false],	hints: [true, false], informations: [true, false]
	};
}

/**
 * Get just the problems-copy args priorities, for ordering in suggestions.
 * @returns {Object}
 */
exports.getPriorities = function () {
	return {
		errors: "01", warnings: "02",	hints: "03", informations: "04"
	};
}

/**
 * Get just the problems-copy args descriptions, for suggestions.
 * @returns {Object}
 */
exports.getDescriptions = function () {
	return {
    errors: "Show all Errors.", warnings: "Show all Warnings.",
    hints: "Show all Hints.", informations: "Show all Informations."
	};
}

/**
 * Get the default values for all problems-copy keys
 * @returns {Object} - {"errors": true, "warnings": true}
 */
exports.getDefaults = function () {
	return {
		"errors": true,
		"warnings": true,
		"hints": true,
		"informations": true
	};
}