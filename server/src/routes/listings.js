import express from 'express';
import { reqHanlerWrapper } from './auth';
import authenticateToken from '../middlewares/auth';
import { isValidUserAuthObj } from '../utils/users';
import { forbiddenErr, successStatusCodes } from '../utils';
import {
	createListing,
	deleteListing,
	getListings,
	updateListing,
	getAllListings,
} from '../data/listings';
import {
	isValidCreateListingObj,
	isValidSearchAreaQuery,
	isValidUpdateListingObj,
} from '../utils/listings';

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
			const { north, east, south, west, placeId, formattedAddress } = req.query;
			const searchArea = isValidSearchAreaQuery({
				north,
				east,
				south,
				west,
				placeId,
				formattedAddress,
			});
			const listings = await getListings(searchArea);
			res.json({ listings });
		})
	);

router
	.route('/:id')
	.patch(
		authenticateToken,
		reqHanlerWrapper(async (req, res) => {
			const { user } = req;
			const listingId = req.params.id;
			const validatedUser = isValidUserAuthObj(user);
			if (validatedUser.role !== 'lessor')
				throw forbiddenErr(
					'You cannot update a listing if you have registered as a tenant'
				);
			const listingObj = isValidUpdateListingObj(req.body);
			const listing = await updateListing(listingId, validatedUser, listingObj);
			res.status(successStatusCodes.CREATED).json({ listing });
		})
	)
	.delete(
		authenticateToken,
		reqHanlerWrapper(async (req, res) => {
			const { user } = req;
			const listingId = req.params.id;
			const validatedUser = isValidUserAuthObj(user);
			if (validatedUser.role !== 'lessor')
				throw forbiddenErr(
					'You cannot update a listing if you have registered as a tenant'
				);
			const listing = await deleteListing(listingId, validatedUser);
			res.status(successStatusCodes.OK).json({ listing });
		})
	);

router.route('/mylistings').get(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		console.log('in here');
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser.role !== 'lessor')
			throw forbiddenErr(
				'You cannot view your listings if you have registered as a tenant'
			);
		const listings = await getAllListings(validatedUser);
		console.log(listings);
		res.json({ listings });
	})
);

export default router;
