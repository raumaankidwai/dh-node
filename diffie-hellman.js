const net = require("net");

const DH_PORT = 62720;

function log (s) {
	console.log((Date.now() / 1000) + ": " + s);
}

function DiffieHellman (reciever) {
	this.reciever = reciever;
	
	this.generator = 3;
	this.modulus = 17;
	
	this.secret = Math.floor(Math.random() * this.modulus);
	this.remainder = Math.pow(this.generator, this.secret) % this.modulus;
	
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
		
		callback();
	};
	
	log("Sending generator, modulus, and remainder...");
	
	this.rawSend(this.generator.toString(), () => {});
	this.rawSend(this.modulus.toString(), () => {});
	this.rawSend(this.remainder.toString(), () => {});
	
	log("Done!");
};

DiffieHellman.prototype.handleResponse = function (response, callback) {
	var data = (Array.from(response).join(",") + ",").split("255,").map(cur => cur.substr(0, cur.length - 1).split(",")).filter(cur => cur.join("").length).map(cur => Buffer.from(cur).toString());
	
	if (this.initialized) {
		log("Got message!");
		log(this.decrypt(data[0]));
		
		return callback();
	}
	
	if (data.length > 1) {
		log("Got generator, modulus, and remainder!");
		
		this.generator = +data[0];
		this.modulus = +data[1];
		this.secret = Math.floor(Math.random() * this.modulus);
		
		var remainder = Math.pow(this.generator, this.secret) % this.modulus;
		
		log("Sending remainder...");
		
		this.rawSend(remainder.toString(), () => {});
		
		log("Done!\n");
		log("Computing shared secret...");
		
		this.sharedSecret = Math.pow(remainder, this.secret) % this.modulus;
		
		log("Done!");
	} else {
		log("Got remainder!");
		log("Computing shared secret...");
		
		this.sharedSecret = Math.pow(+data[0], this.secret) % this.modulus;
		
		log("Done!");
	}
	
	this.initCallback();
};

DiffieHellman.prototype.encrypt = function (data) {
	return data + this.sharedSecret;
};

DiffieHellman.prototype.decrypt = function (data) {
	return data;
};

DiffieHellman.prototype.send = function (data, callback) {
	if (!this.initialized) {
		log("ERROR: Protocol not initialized.");
		
		return callback();
	}
	
	this.rawSend(this.encrypt(data), callback);
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
