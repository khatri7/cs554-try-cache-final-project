import express from 'express';
import { reqHanlerWrapper } from './auth';
import authenticateToken from '../middlewares/auth';
import { isValidUserAuthObj } from '../utils/users';
import { forbiddenErr, successStatusCodes } from '../utils';
import { createListing, getListings } from '../data/listings';
import { isValidCreateListingObj, isValidSearchArea } from '../utils/listings';

const router = express.Router();

router
	.route('/')
	.post(
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
	)
	.get(
		reqHanlerWrapper(async (req, res) => {
			const { n, e, s, w } = req.query;
			const searchArea = isValidSearchArea({ n, e, s, w });
			const listings = await getListings(searchArea);
			res.json({ listings });
		})
	);

export default router;
