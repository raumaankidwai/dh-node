const crypto = require("crypto");

var util = {
	encrypt: (data, key) => {
		return data + key;
	},
	decrypt: (data, key) => {
		return data;
	},
	
	isPrime: (n) => {
		var i = 1, s = Math.sqrt(n);
		
		for (; ++i < s;) {
			if (!(n % i)) {
				return false;
			}
		}
		
		return true;
	},
	
	getRandom32: () => crypto.randomBytes(4).readUInt32BE(0),
	getRandomPrime: () => {
		var n;
		
		while (!util.isPrime(n = util.getRandom32()));
		
		return n;
	},
	
	largePowerMod: (a, b, c) => {
		if (b === 0) {
			return 1;
		}
		
		a %= c;
		
		if (b === 1) {
			return a;
		}
		
		if (b % 2) {
			return a * util.largePowerMod(a * a, (b - 1) / 2, c) % c;
		}
		
		return util.largePowerMod(a * a, b / 2, c) % c;
	}
};

module.exports = util;
