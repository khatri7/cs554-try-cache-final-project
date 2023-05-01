import express from 'express';
import { reqHanlerWrapper } from './auth';
import authenticateToken from '../middlewares/auth';
import { isValidUserAuthObj } from '../utils/users';
import {
	badRequestErr,
	forbiddenErr,
	// isValidJwtString,
	isValidObjectId,
	isValidStr,
	successStatusCodes,
} from '../utils';
import {
	approveApplication,
	createApplication,
	getApplicationById,
	getUserApplications,
	rejectapplication,
} from '../data/applications';

import { isValidCreateApplicationObj } from '../utils/applications';
import uploadMedia from '../middlewares/uploadMedia';
import { getUserById } from '../data/users';
import { createCheckoutSession, getCheckoutSession } from '../configs/stripe';

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

router.route('/payment').post(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		if (req.headers.origin !== process.env.CLIENT_URL)
			throw forbiddenErr('Origin not allowed');
		const validatedUser = isValidUserAuthObj(req.user);
		const { firstName, lastName, email, phone } = await getUserById(
			validatedUser._id
		);
		const session = await createCheckoutSession(
			firstName,
			lastName,
			email,
			phone
		);
		res.redirect(303, session.url);
	})
);

router.route('/payment/success').get(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		const { session_id: sessionId } = req.query;
		if (!sessionId) throw badRequestErr('No session id found');
		const session = await getCheckoutSession(sessionId);
		console.log(session.payment_status);
		res.redirect(303, 'http://localhost:3000/success');
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

router.route('/lessor/reject/:id').post(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		// update application by referencing the ID of the Property and the User ID
		let { id } = req.params;
		id = isValidObjectId(id);
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);

		if (validatedUser.role !== 'lessor')
			throw forbiddenErr(
				'You cannot update an Application if are logged in as Tenant'
			);
		const application = await rejectapplication(id, validatedUser);

		res.status(successStatusCodes.CREATED).json({ application });
	})
);

router.route('/:id/lessor/approve').post(
	authenticateToken,
	uploadMedia('lease'),
	reqHanlerWrapper(async (req, res) => {
		// update application by referencing the ID of the Property and the User ID
		let { id } = req.params;
		id = isValidObjectId(id);
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		const text = req.body.text
			? isValidStr(req.body.text, 'parameter text')
			: '';
		if (validatedUser.role !== 'lessor')
			throw forbiddenErr(
				'You cannot update an Application if are logged in as Tenant'
			);
		const application = await approveApplication(
			id,
			text,
			validatedUser,
			req.file
		);

		res.status(successStatusCodes.CREATED).json({ application });
	})
);

export default router;
