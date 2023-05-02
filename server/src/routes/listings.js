import express from 'express';
import { reqHanlerWrapper } from './auth';
import authenticateToken from '../middlewares/auth';
import { isValidUserAuthObj } from '../utils/users';
import {
	forbiddenErr,
	isValidStr,
	successStatusCodes,
	isValidObjectId,
	badRequestErr,
} from '../utils';
import {
	createListing,
	deleteListing,
	getListings,
	updateListing,
	getAllListings,
	uploadImageListingImage,
	deleteUploadImageListingImage,
} from '../data/listings';
import {
	isValidCreateListingObj,
	isValidSearchAreaQuery,
	isValidUpdateListingObj,
} from '../utils/listings';
import { uploadMedia } from '../middlewares/uploadMedia';

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
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser.role !== 'lessor')
			throw forbiddenErr(
				'You cannot view your listings if you have registered as a tenant'
			);
		const listings = await getAllListings(validatedUser);
		res.json({ listings });
	})
);

router.route('/:id/uploadImage').post(
	authenticateToken,
	uploadMedia('image'),
	reqHanlerWrapper(async (req, res) => {
		// update listing by referencing the ID of the Property and the User ID
		let { id } = req.params;
		const pos = isValidStr(req.body.position);
		id = isValidObjectId(id, 'id');
		if (!(Number(pos) >= 1 && Number(pos) <= 4))
			throw badRequestErr('Position value should be between 1-5', 'pos');
		const { user } = req;

		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser.role !== 'lessor')
			throw forbiddenErr(
				'You cannot update an Application if are logged in as Tenant'
			);
		const listing = await uploadImageListingImage(
			id,
			pos,
			validatedUser,
			req.file
		);

		res.status(successStatusCodes.CREATED).json({ listing });
		// res.status(successStatusCodes.CREATED).json({ 1: 'listing' });
	})
);

router.route('/:id/deleteImage').post(
	authenticateToken,
	reqHanlerWrapper(async (req, res) => {
		let { id } = req.params;

		const pos = isValidStr(req.body.position);
		console.log(req.body.position);
		console.log(req.body.position + 2);
		// id = isValidObjectId(id, 'id');
		if (!(Number(pos) >= 1 && Number(pos) <= 4))
			throw badRequestErr('Position value should be between 1-5', 'pos');
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser.role !== 'lessor')
			throw forbiddenErr(
				'You cannot update an Application if are logged in as Tenant'
			);
		console.log('here 006');
		const listing = await deleteUploadImageListingImage(id, pos, validatedUser);

		res.status(successStatusCodes.CREATED).json({ listing });
		// res.status(successStatusCodes.CREATED).json({ 1: 'listing' });
	})
);

export default router;
