import express from 'express';
import { reqHanlerWrapper } from './auth';
import authenticateToken from '../middlewares/auth';
import { isValidUserAuthObj } from '../utils/users';
import { forbiddenErr, successStatusCodes } from '../utils';
import { createListing } from '../data/listings';
import { isValidCreateListingObj } from '../utils/listings';

const router = express.Router();

router.route('/').post(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser.role !== 'lessor')
			throw forbiddenErr(
				'You cannot create a listing if you have registered as a tenant'
			);
		const listingObj = isValidCreateListingObj(req.body);
		const listing = await createListing(listingObj, validatedUser);
		res.status(successStatusCodes.CREATED).json({ listing });
	})
);

export default router;
