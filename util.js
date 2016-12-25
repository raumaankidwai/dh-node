module.exports = {
	encrypt: (data, key) => {
		return data + this.sharedSecret;
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
		
		while (!this.isPrime(n = this.getRandom32()));
		
		return n;
	}
};
