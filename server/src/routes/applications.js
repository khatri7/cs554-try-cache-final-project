import express from 'express';

import { reqHanlerWrapper } from './auth';
import authenticateToken from '../middlewares/auth';
import { isValidUserAuthObj } from '../utils/users';
import { forbiddenErr, isValidObjectId, successStatusCodes } from '../utils';
import {
	createApplication,
	getApplicationById,
	getUserApplications,
} from '../data/applications';
import { isValidCreateApplicationObj } from '../utils/applications';
import uploadMedia from '../middlewares/uploadMedia';

const router = express.Router();

router.route('/my-applications').get(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		const applications = await getUserApplications(validatedUser);
		res.json({ applications });
	})
);

router.route('/:id').get(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		let { id } = req.params;
		id = isValidObjectId(id);
		const application = await getApplicationById(id, validatedUser);
		res.json({ application });
	})
);

router.route('/').post(
	authenticateToken,
	uploadMedia('document'),
	reqHanlerWrapper(async (req, res) => {
		// Create application by referencing the ID of the Property and the User ID
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser.role !== 'tenant')
			throw forbiddenErr(
				'You cannot create an Application if you have registered as a lessor'
			);
		const appliObj = isValidCreateApplicationObj(req.body);
		const application = await createApplication(
			appliObj,
			validatedUser,
			req.file
		);
		res.status(successStatusCodes.CREATED).json({ application });
	})
);

export default router;
