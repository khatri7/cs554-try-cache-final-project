import { MongoClient } from 'mongodb';

let connection;
let db;

const dbConnection = async () => {
	if (!connection) {
		connection = await MongoClient.connect(process.env.MONGODB_URL);
		db = await connection.db(process.env.MONGODB_DATABASE);
	}
	return db;
};

// const closeConnection = () => {
// 	connection?.close();
// };

const getCollectionFn = (collection) => {
	let col;
	return async () => {
		if (!col) {
			const database = await dbConnection();
			col = await database.collection(collection);
		}
		return col;
	};
};
export const applications = getCollectionFn('applications');
export const users = getCollectionFn('users');
export const listings = getCollectionFn('listings');
