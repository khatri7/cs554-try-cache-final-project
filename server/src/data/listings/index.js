import { ObjectId } from 'mongodb';
import { listings } from '../../configs/mongodb';
import {
	badRequestErr,
	forbiddenErr,
	internalServerErr,
	isValidObjectId,
	notFoundErr,
	isNumberChar,
	isValidStr,
} from '../../utils';
import {
	isValidCreateListingObj,
	isValidSearchAreaQuery,
	isValidUpdateListingObj,
} from '../../utils/listings';
import { isValidUserAuthObj } from '../../utils/users';
import redis from '../../configs/redis';
import { deleteObject, upload } from '../../configs/awsS3';
// One day in seconds
const ONE_DAY = 86400;

export const getListingById = async (idParam) => {
	const id = isValidObjectId(idParam);
	const listingsCollection = await listings();
	const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
	if (!listing) throw notFoundErr('No listing found for the provided id');
	return listing;
};

const checkListingExists = async (location, apt) => {
	const listingsCollection = await listings();
	const listing = await listingsCollection.findOne({
		'location.placeId': location.placeId,
	});
	if (listing && !listing.apt)
		throw badRequestErr('A listing for this location already exists');
	if (listing && !apt)
		throw badRequestErr('A listing for this location already exists');
	if (listing && listing.apt === apt)
		throw badRequestErr('A listing for this location already exists');
};

export const createListing = async (listingObjParam, user) => {
	const validatedUser = isValidUserAuthObj(user);
	if (validatedUser.role !== 'lessor')
		throw forbiddenErr(
			'You cannot create a listing if you have registered as a tenant'
		);
	const {
		apt,
		description,
		bedrooms,
		bathrooms,
		rent,
		deposit,
		availabilityDate,
		location,
	} = isValidCreateListingObj(listingObjParam);
	await checkListingExists(location, apt);
	const listingObj = {
		listedBy: new ObjectId(user._id),
		apt,
		description,
		bedrooms,
		bathrooms,
		rent,
		deposit,
		availabilityDate,
		location: {
			...location,
			type: 'Point',
			coordinates: [location.lng, location.lat],
		},
		occupied: false,
		photos: [],
	};
	const listingsCollection = await listings();
	const createListingAck = await listingsCollection.insertOne(listingObj);
	if (!createListingAck?.acknowledged || !createListingAck?.insertedId)
		throw internalServerErr('Could not create listing. Please try again');
	const createdListing = await getListingById(
		createListingAck.insertedId.toString()
	);
	return createdListing;
};

export const getListings = async (searchAreaParam) => {
	const searchArea = isValidSearchAreaQuery(searchAreaParam);
	const listingsFromCache = await redis.read(searchArea.placeId);
	if (listingsFromCache) return listingsFromCache.listings;
	const listingsCollection = await listings();
	const listingsArr = await listingsCollection
		.find({
			location: {
				$geoWithin: {
					$box: [
						[searchArea.west, searchArea.south],
						[searchArea.east, searchArea.north],
					],
				},
			},
		})
		.toArray();
	await redis.cache(
		searchArea.placeId,
		{
			...searchArea,
			listings: listingsArr,
		},
		{ EX: ONE_DAY },
		true
	);
	return listingsArr;
};

export const updateListing = async (listingIdParam, user, listingObjParam) => {
	const id = isValidObjectId(listingIdParam);
	const validatedUser = isValidUserAuthObj(user);
	if (validatedUser.role !== 'lessor')
		throw forbiddenErr('You cannot update a listing if you are not the owner');
	const { description, rent, deposit, availabilityDate, occupied } =
		isValidUpdateListingObj(listingObjParam);

	const oldListing = await getListingById(id);
	if (validatedUser._id !== oldListing.listedBy.toString()) {
		throw forbiddenErr('You cannot update a listing if you are not the owner');
	}
	const updateListingObj = {
		apt: oldListing.apt,
		description: description || oldListing.description,
		bedrooms: oldListing.bedrooms,
		bathrooms: oldListing.bathrooms,
		rent: rent || oldListing.rent,
		deposit: deposit || oldListing.deposit,
		availabilityDate: availabilityDate || oldListing.availabilityDate,
		location: oldListing.location,
		occupied: occupied || oldListing.occupied,
		photos: oldListing.photos,
	};
	const listingsCollection = await listings();
	const updateListingAck = await listingsCollection.findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: updateListingObj },
		{ returnDocument: 'after' }
	);

	if (updateListingAck.lastErrorObject.n === 0)
		throw notFoundErr('Listing Not Found');

	return updateListingAck.value;
};

export const uploadImageListingImage = async (
	listingIdParam,
	position,
	user,
	document
) => {
	const pos = isValidStr(position, 'position');
	if (
		!isNumberChar(pos) ||
		Number.parseInt(pos, 10) < 1 ||
		Number.parseInt(pos, 10) > 5
	)
		throw badRequestErr('Position value should be between 1-5');
	const id = isValidObjectId(listingIdParam);
	const validatedUser = isValidUserAuthObj(user);
	if (validatedUser.role !== 'lessor')
		throw forbiddenErr('You cannot update a listing if you are not the owner');
	const listing = await getListingById(id);
	if (listing.listedBy.toString() !== validatedUser._id)
		throw forbiddenErr('Only the owner of the listing can update it');
	if (!document) throw badRequestErr('Image not passed');
	if (
		!(document.mimetype === 'image/png' || document.mimetype === 'image/jpeg')
	)
		throw badRequestErr('Image has to be of type PNG, JPEG or JPG');
	const docKey = `listings/${listing._id.toString()}/image/${document.pos}`;
	const image = await upload(docKey, document.buffer, document.mimetype);
	const photosArr = listing.photos;
	photosArr[Number.parseInt(pos, 10)] = image;
	const listingsCollection = await listings();
	const updateListingAck = await listingsCollection.findOneAndUpdate(
		{ _id: listing._id },
		{ $set: { photos: photosArr } },
		{ returnDocument: 'after' }
	);
	if (updateListingAck.lastErrorObject.n === 0)
		throw notFoundErr('Listing Not Found');
	return updateListingAck.value;
};

export const deleteUploadImageListingImage = async (
	listingIdParam,
	position,
	user
) => {
	const pos = isValidStr(position, 'position');
	if (
		!isNumberChar(pos) ||
		Number.parseInt(pos, 10) < 1 ||
		Number.parseInt(pos, 10) > 5
	)
		throw badRequestErr('Position value should be between 1-5');
	const id = isValidObjectId(listingIdParam, 'listing id');
	const validatedUser = isValidUserAuthObj(user);
	if (validatedUser.role !== 'lessor')
		throw forbiddenErr('You cannot update a listing if you are a tenant');
	const listing = await getListingById(id);
	if (listing.listedBy.toString() !== validatedUser._id)
		throw forbiddenErr('Only the owner of the listing can update it');
	const photosArr = listing.photos;
	if (!photosArr[Number.parseInt(pos, 10)])
		throw badRequestErr('There is no image for given position');
	photosArr[Number.parseInt(pos, 10)] = null;
	const docKey = `listings/${listing._id.toString()}/image/${document.pos}`;
	await deleteObject(docKey);
	const listingsCollection = await listings();
	const updateListingAck = await listingsCollection.findOneAndUpdate(
		{ _id: listing._id },
		{ $set: { photos: photosArr } }
	);
	if (updateListingAck.lastErrorObject.n === 0)
		throw notFoundErr('Listing Not Found');
	return updateListingAck.value;
};

export const deleteListing = async (id, user) => {
	const listingIdParam = isValidObjectId(id);
	const validatedUser = isValidUserAuthObj(user);
	if (validatedUser.role !== 'lessor')
		throw forbiddenErr('You cannot update a listing if you are not the owner');

	const oldListing = await getListingById(id);
	if (validatedUser._id !== oldListing.listedBy.toString()) {
		throw forbiddenErr('You cannot delete a listing if you are not the owner');
	}
	const listingsCollection = await listings();
	const deletionInfo = await listingsCollection.findOneAndDelete({
		_id: new ObjectId(listingIdParam),
	});
	if (deletionInfo.lastErrorObject.n === 0)
		throw notFoundErr('Listing Not Found');

	return { listingId: listingIdParam, deleted: true };
};

export const getAllListings = async (user) => {
	if (user.role !== 'lessor')
		throw forbiddenErr(
			'You cannot display listings if you have registered as a tenant'
		);
	const listingsCollection = await listings();
	const listingsArr = await listingsCollection
		.find({ listedBy: new ObjectId(user._id) })
		.toArray();
	return listingsArr;
};
