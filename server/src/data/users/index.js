import { ObjectId } from 'mongodb';
import { users } from '../../configs/mongodb';
import {
	badRequestErr,
	createJwt,
	internalServerErr,
	isValidObjectId,
	notFoundErr,
} from '../../utils';
import {
	comparePassword,
	hashPassword,
	isValidEmail,
	isValidUserLoginObj,
	isValidUserObj,
} from '../../utils/users';

const getUserByEmail = async (emailParam) => {
	const email = isValidEmail(emailParam);
	const usersCollection = await users();
	const user = await usersCollection.findOne({ email });
	if (!user) throw notFoundErr('No user found for the provided email');
	return user;
};

export const getUserById = async (idParam) => {
	const id = isValidObjectId(idParam);
	const usersCollection = await users();
	const user = await usersCollection.findOne({ _id: new ObjectId(id) });
	if (!user) throw notFoundErr('No user found for the provided id');
	return user;
};

const checkEmailTaken = async (emailParam) => {
	const email = isValidEmail(emailParam);
	let user = null;
	try {
		user = await getUserByEmail(email);
	} catch (e) {
		if (e.status === 404) return true;
	}
	if (user && user.email.toLowerCase() === email.toLowerCase())
		throw badRequestErr('An account with the provided email already exists');
	return true;
};

export const authenticateUser = async (userLoginObjParam) => {
	const userLoginObj = isValidUserLoginObj(userLoginObjParam);
	try {
		const { _id, firstName, lastName, email, role, password } =
			await getUserByEmail(userLoginObj.email);
		const doPasswordsMatch = await comparePassword(
			userLoginObj.password,
			password
		);
		if (!doPasswordsMatch) throw badRequestErr('Invalid email or password');
		const token = createJwt({
			user: {
				_id,
				email,
				role,
			},
		});
		return {
			user: { _id, firstName, lastName, email, role },
			token,
		};
	} catch (e) {
		throw badRequestErr('Invalid email or Password');
	}
};

export const createUser = async (userObjParam) => {
	await checkEmailTaken(userObjParam.email);
	const userObj = isValidUserObj(userObjParam);
	const password = await hashPassword(userObj.password);
	const usersCollection = await users();
	const result = await usersCollection.insertOne({
		...userObj,
		password,
	});
	if (!result?.acknowledged || !result?.insertedId)
		throw internalServerErr('Could not create user. Please try again');
	await getUserById(result.insertedId.toString());
	const createdUser = await authenticateUser({
		email: userObj.email,
		password: userObj.password,
	});
	return createdUser;
};
