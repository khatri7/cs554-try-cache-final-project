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
	isNumberChar,
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

router.route('/:id/image').post(
	authenticateToken,
	uploadMedia('image'),
	reqHandlerWrapper(async (req, res) => {
		// update listing by referencing the ID of the Property and the User ID
		let { id } = req.params;
		const pos = isValidStr(req.body.position, 'position');
		id = isValidObjectId(id, 'id');
		if (
			!isNumberChar(pos) ||
			Number.parseInt(pos, 10) < 1 ||
			Number.parseInt(pos, 10) > 5
		)
			throw badRequestErr('Position value should be between 1-5');
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
	})
);

router.route('/:id/image').delete(
	authenticateToken,
	reqHandlerWrapper(async (req, res) => {
		let { id } = req.params;
		const pos = isValidStr(req.body.position, 'position');
		if (
			!isNumberChar(pos) ||
			Number.parseInt(pos, 10) < 1 ||
			Number.parseInt(pos, 10) > 5
		)
			throw badRequestErr('Position value should be between 1-5');
		id = isValidObjectId(id, 'id');
		const { user } = req;
		const validatedUser = isValidUserAuthObj(user);
		if (validatedUser.role !== 'lessor')
			throw forbiddenErr(
				'You cannot update an Application if are logged in as Tenant'
			);
		const listing = await deleteUploadImageListingImage(id, pos, validatedUser);

		res.json({ listing });
	})
);

export default router;
