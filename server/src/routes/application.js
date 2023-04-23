import express from 'express';

import { reqHanlerWrapper } from './auth';
import authenticateToken from '../middlewares/auth';
import { isValidUserAuthObj } from '../utils/users';
import { forbiddenErr, isValidObjectId, successStatusCodes } from '../utils';
import { createApplication, getApplicationById } from '../data/applications';
import { isValidCreateApplicationObj } from '../utils/applications';

const router = express.Router();

router.route('/:id').get(async (req, res) => {
	// Using ID of application fetch the record
	// Also fetch relevant property and user information of the application.
	let { id } = req.params;
	id = isValidObjectId(id);
	const application = await getApplicationById(id);
	res.status(successStatusCodes.CREATED).json({ application });
});

router.route('/').post(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		// Create application by referencing the ID of the Property and the User ID
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser.role !== 'tenant')
			throw forbiddenErr(
				'You cannot create an Application if you have registered as a tenant'
			);
		const appliObj = isValidCreateApplicationObj(req.body);
		const application = await createApplication(appliObj, validatedUser);
		res.status(successStatusCodes.CREATED).json({ application });
	})
);

export default router;
