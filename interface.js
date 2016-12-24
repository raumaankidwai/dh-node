const diffieHellman = require("./diffie-hellman.js");
const readline = require("readline");

var prompter = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true
});

function prompt () {
	prompter.question("> ", function (line) {
		diffieHellman(line, prompt);
	});
}

prompt();
