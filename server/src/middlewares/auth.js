import { getUserById } from '../data/users';
import {
	isValidJwtString,
	isValidObjectId,
	sendErrResp,
	unauthorizedErr,
} from '../utils';
import { isValidEmail, isValidUserRole } from '../utils/users';

const authenticateToken = async (req, res, next) => {
	try {
		const { token } = req.cookies;
		if (!token) throw unauthorizedErr('No JWT found');
		try {
			const { user } = isValidJwtString(token);
			user._id = isValidObjectId(user._id);
			user.email = isValidEmail(user.email);
			user.role = isValidUserRole(user.role);
			const dbUser = await getUserById(user._id);
			if (dbUser.email !== user.email) throw new Error();
			req.user = user;
			next();
		} catch (e) {
			res.clearCookie('token');
			throw unauthorizedErr('Invalid JWT');
		}
	} catch (e) {
		sendErrResp(res, e);
	}
};

export default authenticateToken;
