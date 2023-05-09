import redis from 'redis';

/* use this for local redis server */
// const client = redis.createClient();

let isReady = false;

/* use this for redis cloud */
const getEnvVariables = () => {
	return new Promise((resolve) => {
		if (process.env.REDIS_CLOUD_HOST) {
			resolve();
		} else {
			const checkInterval = setInterval(() => {
				if (process.env.REDIS_CLOUD_HOST) {
					clearInterval(checkInterval);
					resolve();
				}
			}, 100);
		}
	});
};

let client;

getEnvVariables().then(() => {
	client = redis.createClient({
		password: process.env.REDIS_CLOUD_PASSWORD,
		socket: {
			host: process.env.REDIS_CLOUD_HOST,
			port: process.env.REDIS_CLOUD_PORT,
		},
	});
});
/* end of redis cloud config */

client?.connect().then(() => {
	isReady = true;
});

client?.on('error', (err) => {
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
			if (value !== null) value = JSON.parse(value);
		} catch {
			/* empty */
		}
		return value;
	} catch {
		return null;
	}
};

const updatePopularLocalities = async (placeId) => {
	try {
		if (isReady) {
			await client.zIncrBy(
				'tc_popular_localities',
				1,
				`tc_locality_${placeId}`
			);
		}
	} catch {
		/* empty */
	}
};

const getTopTenPopularLocalities = async () => {
	try {
		if (!isReady) return [];
		const localities = await client.zRange('tc_popular_localities', 0, 9, {
			REV: true,
		});
		return localities;
	} catch {
		return [];
	}
};

const getKeys = async (pattern) => {
	try {
		if (!isReady) return [];
		const keys = await client.keys(pattern);
		return keys;
	} catch {
		return [];
	}
};

const delCache = async (key) => {
	try {
		if (isReady) await client.del(key);
	} catch {
		/* empty */
	}
};

const delAllCache = async () => {
	const keys = await getKeys('tc_*');
	await Promise.all(keys.map((key) => delCache(key)));
};

export default {
	cache,
	read,
	updatePopularLocalities,
	getTopTenPopularLocalities,
	getKeys,
	delCache,
	delAllCache,
};
