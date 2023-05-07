import express from 'express';
import authenticateToken from '../middlewares/auth';
import { reqHandlerWrapper } from './auth';
import { isValidUserAuthObj, isValidUserUpdateObj } from '../utils/users';
import {
	badRequestErr,
	forbiddenErr,
	isValidObjectId,
	successStatusCodes,
} from '../utils';
import { updateUserDetails } from '../data/users';

const router = express.Router();

router.route('/:id').patch(
	authenticateToken,
	reqHandlerWrapper(async (req, res) => {
		const { id } = req.params;
		const userId = isValidObjectId(id);
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser._id !== userId)
			throw forbiddenErr('You cannot update details of another user');
		const updateUserObj = isValidUserUpdateObj(req.body);
		if (Object.keys(updateUserObj).length === 0)
			throw badRequestErr('No valid keys for updating provided');
		const updatedUser = await updateUserDetails(
			userId,
			updateUserObj,
			validatedUser
		);
		res.status(successStatusCodes.CREATED).json({
			user: updatedUser,
		});
	})
);

export default router;
