import express from 'express';
import { authenticateUser, createUser, getUserById } from '../data/users';
import {
	isValidJwtString,
	isValidObjectId,
	successStatusCodes,
} from '../utils';
import {
	isValidEmail,
	isValidUserLoginObj,
	isValidUserObj,
	isValidUserRole,
} from '../utils/users';
import authenticateToken from '../middlewares/auth';

const FOUR_DAYS = 345600000;

export const reqHanlerWrapper = (reqHandler) => (req, res, next) => {
	reqHandler(req, res, next).catch(next);
};

const router = express.Router();

router.route('/').post(async (req, res) => {
	try {
		if (!req.cookies?.token) throw new Error();
		const { token } = req.cookies;
		const { user } = isValidJwtString(token);
		user._id = isValidObjectId(user._id);
		user.email = isValidEmail(user.email);
		user.role = isValidUserRole(user.role);
		const dbUser = await getUserById(user._id);
		if (dbUser.email !== user.email) throw new Error();
		return res.json({
			user: {
				_id: dbUser._id,
				firstName: dbUser.firstName,
				lastName: dbUser.lastName,
				email: dbUser.email,
				phone: dbUser.phone,
				role: dbUser.role,
			},
		});
	} catch (e) {
		return res.clearCookie('token').send();
	}
});

router.route('/signup').post(
	reqHanlerWrapper(async (req, res) => {
		const userObj = await isValidUserObj(req.body);
		const { user, token } = await createUser(userObj);
		res
			.cookie('token', token, {
				maxAge: FOUR_DAYS,
				httpOnly: true,
				sameSite: 'lax',
			})
			.status(successStatusCodes.CREATED)
			.json({ user });
	})
);

router.route('/login').post(
	reqHanlerWrapper(async (req, res) => {
		const userLoginObj = isValidUserLoginObj(req.body);
		const { user, token } = await authenticateUser(userLoginObj);
		res
			.cookie('token', token, {
				maxAge: FOUR_DAYS,
				httpOnly: true,
				sameSite: 'lax',
			})
			.status(successStatusCodes.CREATED)
			.json({ user });
	})
);

router.route('/logout').post(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		res.clearCookie('token').status(successStatusCodes.CREATED).send();
	})
);

export default router;
