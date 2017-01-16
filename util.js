const crypto = require("crypto");
const bi = require("./bitint.js");

var util = {
	encrypt: (data, key) => {
		return data;
	},
	decrypt: (data, key) => {
		return data;
	},
	bi: bi
};

module.exports = util;
