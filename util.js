module.exports = {
	encrypt: (data, key) => {
		return data + this.sharedSecret;
	},
	decrypt: (data, key) => {
		return data;
	},
	getPrime = () => {
		return 17;
	}
};
