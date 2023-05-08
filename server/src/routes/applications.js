import express from 'express';
import xss from 'xss';
import { reqHandlerWrapper } from './auth';
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
	completeApplication,
	updatePaymentStatus,
	deleteApplications,
} from '../data/applications';
import {
	applicationStatus,
	isValidCreateApplicationObj,
} from '../utils/applications';
import { getUserById } from '../data/users';
import { createCheckoutSession, getCheckoutSession } from '../configs/stripe';
import { uploadMedia, uploadMedias } from '../middlewares/uploadMedia';

const router = express.Router();

router.route('/my-applications').get(
	authenticateToken,
	reqHandlerWrapper(async (req, res) => {
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		const applicationsW = await getUserApplications(validatedUser);
		res.json({ applicationsW });
	})
);


router
	.route('/:id')
	.get(
		authenticateToken,
		reqHandlerWrapper(async (req, res) => {
			const { user } = req;
			const validatedUser = isValidUserAuthObj(user);
			let { id } = req.params;
			id = isValidObjectId(xss(id));
			const application = await getApplicationById(id, validatedUser);
			res.json({ application });
		})
	)
	.delete(
		authenticateToken,
		reqHandlerWrapper(async (req, res) => {
			const { user } = req;
			const validatedUser = isValidUserAuthObj(user);
			if (validatedUser.role !== 'lessor')
				throw forbiddenErr('You cannot delete this if you are not a Lessor.');
			let { id } = req.params;
			id = isValidObjectId(xss(id));
			const updatedApplications = await deleteApplications(id);
			res.json({ updatedApplications });
		})
	);


router.route('/:id/payment').post(
	authenticateToken,
	reqHandlerWrapper(async (req, res) => {
		// if (req.headers.origin !== (process.env.CLIENT_URL || "http://localhost:3000"))
		// 	throw forbiddenErr('Origin not allowed');
		const { successUrl, cancelUrl } = req.query;
		const { id } = req.params;
		const applicationId = isValidObjectId(xss(id));
		const validatedUser = isValidUserAuthObj(req.user);
		const { firstName, lastName, email, phone } = await getUserById(
			validatedUser._id
		);
		const application = await getApplicationById(applicationId, validatedUser);
		if (application.status !== applicationStatus.PAYMENT_PENDING)
			throw badRequestErr('You cannot initiate a payment at current status');
		const session = await createCheckoutSession(
			validatedUser._id,
			firstName,
			lastName,
			email,
			phone,
			applicationId,
			successUrl,
			cancelUrl
		);
		res.json({
			paymentUrl: session.url,
		});
	})
);

router.route('/:id/payment/success').get(
	authenticateToken,
	reqHandlerWrapper(async (req, res) => {
		const { id } = req.params;
		const applicationId = isValidObjectId(xss(id));
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		const { session_id: sessionId, successUrl } = req.query;
		if (!sessionId) throw badRequestErr('No session id found');
		const session = await getCheckoutSession(sessionId);
		await getApplicationById(applicationId, validatedUser);
		if (validatedUser._id !== session.metadata.user_id)
			throw forbiddenErr('This session was not initiated by you');
		if (applicationId !== session.metadata.application_id)
			throw badRequestErr('Invalid application id and session id combination');
		if (session.payment_status !== 'paid')
			throw badRequestErr('The payment has not been completed');
		const application = await updatePaymentStatus(
			applicationId,
			session,
			validatedUser
		);
		if (successUrl) return res.redirect(303, successUrl);
		return res.json({ application });
	})
);

router.route('/:id/payment/cancel').get(
	authenticateToken,
	reqHandlerWrapper(async (req, res) => {
		const { id } = req.params;
		const applicationId = isValidObjectId(xss(id));
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		const { session_id: sessionId, cancelUrl } = req.query;
		if (!sessionId) throw badRequestErr('No session id found');
		const session = await getCheckoutSession(sessionId);
		await getApplicationById(applicationId, validatedUser);
		if (validatedUser._id !== session.metadata.user_id)
			throw forbiddenErr('This session was not initiated by you');
		if (applicationId !== session.metadata.application_id)
			throw badRequestErr('Invalid application id and session id combination');
		if (session.payment_status === 'paid')
			throw badRequestErr('The payment has been completed');
		if (cancelUrl) return res.redirect(303, cancelUrl);
		const application = await getApplicationById(applicationId, validatedUser);
		return res.json({ application });
	})
);

router.route('/').post(
	authenticateToken,
	uploadMedia('document'),
	reqHandlerWrapper(async (req, res) => {
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

router.route('/:id/lessor/reject').post(
	authenticateToken,
	reqHandlerWrapper(async (req, res) => {
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
	reqHandlerWrapper(async (req, res) => {
		// update application by referencing the ID of the Property and the User ID
		let { id } = req.params;
		id = isValidObjectId(xss(id));
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		const text = xss(req.body.text)
			? isValidStr(xss(req.body.text), 'parameter text')
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

router.route('/:id/tenant/complete').post(
	authenticateToken,
	uploadMedias([
		{
			name: 'lease',
			maxCount: 1,
		},
		{
			name: 'documents',
			maxCount: 5,
		},
	]),
	reqHandlerWrapper(async (req, res) => {
		// update application by referencing the ID of the Property and the User ID
		let { id } = req.params;
		id = isValidObjectId(id);
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		const text = xss(req.body.text)
			? isValidStr(req.body.text, 'parameter text')
			: '';
		if (validatedUser.role !== 'tenant')
			throw forbiddenErr('You cannot update this information as Lessor.');
		await completeApplication(
			id,
			text,
			validatedUser,
			req.files.documents,
			req.files.lease[0]
		);
		let redirectUrl = `/applications/${id}/payment?`;
		if (xss(req.body.successUrl))
			redirectUrl += `successUrl=${xss(req.body.successUrl)}`;
		if (req.body.successUrl && req.body.cancelUrl) redirectUrl += '&';
		if (xss(req.body.cancelUrl))
			redirectUrl += `cancelUrl=${xss(req.body.cancelUrl)}`;
		res.redirect(307, redirectUrl);
	})
);

export default router;
