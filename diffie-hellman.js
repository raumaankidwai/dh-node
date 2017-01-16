/**
	Required methods from bi:
		bi.getRandomPrime(bits)
		bi.getRandomLT(upperBound)
		bi.lpm(a, b, c)
*/

const net = require("net");

const util = require("./util.js");

const DH_PORT = 62720;
const BITS = 16;

function log (s) {
	console.log((Date.now() / 1000) + ": " + s);
}

function DiffieHellman (reciever) {
	this.reciever = reciever;
	
	this.modulus = util.bi.getRandomPrime(BITS);
	
	this.secret = util.bi.getRandomLT(this.modulus);
	
	this.initialized = false;
	
	log("Initializing server...");
	
	this.server = net.createServer((socket) => {
		this.socket = socket;
		
		socket.on("data", (data) => {
			this.handleResponse(data, () => {});
		});
	});
	
	this.server.listen(DH_PORT, "0.0.0.0");
	
	log("Done!\n");
	log("Initializing socket...");
	
	this.socket = new net.Socket();
	
	this.socket.connect(DH_PORT, this.reciever);
	
	this.socket.on("data", (data) => {
		this.handleResponse(data, () => {});
	});
	
	log("Done!");
}

DiffieHellman.prototype.rawSend = function (data, callback) {
	if (this.socket) {
		this.socket.write(Buffer.from(Array.from(Buffer.from(data)).concat([255])), callback);
	} else {
		return callback("Socket not initialized", 0);
	}
};

DiffieHellman.prototype.init = function (callback) {
	this.initCallback = () => {
		this.initialized = true;
		log("Done!");
		callback();
	};
	
	var generator = util.bi.getRandomPrime(BITS);
	
	this.rawSend(Buffer.from(generator), () => {});
	this.rawSend(Buffer.from(this.modulus), () => {});
	this.rawSend(Buffer.from(util.bi.lpm(generator, this.secret, this.modulus)), () => {});
};

DiffieHellman.prototype.handleResponse = function (response, callback) {
	var data = /* split array on 255 to get bit arrays 
	[1, 0, 1, 1, 255, 0, 0, 1, 0, 255] => [[1, 0, 1, 1], [0, 0, 1, 0]]
	*/;
	
	if (this.initialized) {
		log("Got message!");
		log(util.decrypt(data[0]));
		
		return callback();
	}
	
	if (data.length > 1) {
		var secret = util.bi.getRandomLT(data[1]);
		
		var remainder = util.bi.lpm(data[0], secret, data[1]);
		this.sharedSecret = util.bi.lpm(data[2], secret, data[1]);
		
		this.rawSend(Buffer.from(remainder), () => {});
	} else {
		this.sharedSecret = util.largePowerMod(data[0], this.secret, this.modulus);
	}
	
	this.initCallback();
};

DiffieHellman.prototype.send = function (data, callback) {
	if (!this.initialized) {
		log("ERROR: Protocol not initialized.");
		
		return callback();
	}
	
	this.rawSend(util.encrypt(data), callback);
};

var diffieHellman;

function parse (line, callback) {
	var args = line.split(" ");
	var cmd = args.shift();
	
	switch (cmd) {
		case "init":
			log("Initializing new DiffieHellman object...");
			
			diffieHellman = new DiffieHellman(args[0]);
			
			log("Done!\n");
			log(`Initializing Diffie-Hellman protocol (reciever ${args[0]})...\n`);
			
			diffieHellman.init(callback);
		break; case "send":
			log(`Sending data ${args[0]} with Diffie-Hellman protocol to ${diffieHellman.reciever}...`);
			
			diffieHellman.send(args[0], callback);
		break; default:
			log("Unrecognized command. Please try again.");
			callback();
	}
}

module.exports = parse;
