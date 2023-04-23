import redis from 'redis';

const client = redis.createClient();
let isReady = false;

client.connect().then(() => {
	isReady = true;
});
client.on('error', (err) => {
	console.log('Redis Client Error', err);
	isReady = false;
});

const cache = async (key, value, options = {}, stringify = false) => {
	try {
		if (isReady)
			await client.set(key, stringify ? JSON.stringify(value) : value, options);
	} catch {
		/* empty */
	}
};

const read = async (key) => {
	try {
		if (!isReady) return null;
		const exists = await client.exists(key);
		if (!exists) return null;
		let value = await client.get(key);
		try {
			value = JSON.parse(value);
		} catch {
			/* empty */
		}
		return value;
	} catch {
		return null;
	}
};

export default {
	cache,
	read,
};
