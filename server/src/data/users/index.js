import { ObjectId } from 'mongodb';
import { users } from '../../configs/mongodb';
import {
	badRequestErr,
	createJwt,
	forbiddenErr,
	internalServerErr,
	isValidObjectId,
	notFoundErr,
} from '../../utils';
import {
	comparePassword,
	hashPassword,
	isValidEmail,
	isValidUserAuthObj,
	isValidUserLoginObj,
	isValidUserObj,
	isValidUserUpdateObj,
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
		const { _id, firstName, lastName, email, phone, role, password } =
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
			user: { _id, firstName, lastName, email, role, phone },
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

export const updateUserDetails = async (
	userId,
	updateUserObjParam,
	currUserParam
) => {
	const id = isValidObjectId(userId);
	const validatedUser = isValidUserAuthObj(currUserParam);
	if (validatedUser._id !== id)
		throw forbiddenErr('You cannot update details of another user');
	const updateUserObj = isValidUserUpdateObj(updateUserObjParam);
	if (Object.keys(updateUserObj).length === 0)
		throw badRequestErr('No valid keys for updating provided');
	const usersCollection = await users();
	const user = await getUserById(id);
	const updatedUser = {
		...user,
		updateUserObj,
	};
	delete updatedUser._id;
	const updateUserAck = await usersCollection.updateOne(
		{
			_id: new ObjectId(id),
		},
		{ $set: updatedUser }
	);
	if (!updateUserAck.acknowledged || !updateUserAck.modifiedCount)
		throw internalServerErr('Could not update details. Please try again.');
	const postUpdateUser = await getUserById(id);
	return postUpdateUser;
};
