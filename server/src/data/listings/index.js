import { ObjectId } from 'mongodb';
import { listings } from '../../configs/mongodb';
import {
	badRequestErr,
	forbiddenErr,
	internalServerErr,
	isValidObjectId,
	notFoundErr,
} from '../../utils';
import {
	isValidCreateListingObj,
	isValidSearchAreaQuery,
} from '../../utils/listings';
import { isValidUserAuthObj } from '../../utils/users';
import redis from '../../configs/redis';

// One day in seconds
const ONE_DAY = 86400;

export const getListingById = async (idParam) => {
	const id = isValidObjectId(idParam);
	const listingsCollection = await listings();
	const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
	if (!listing) throw notFoundErr('No listing found for the provided id');
	return listing;
};

const checkListingExists = async (location) => {
	const listingsCollection = await listings();
	const listing = await listingsCollection.findOne({
		'location.placeId': location.placeId,
	});
	if (listing)
		throw badRequestErr('A listing for this location already exists');
	return true;
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
	await checkListingExists(location);
	const listingObj = {
		listedBy: user._id,
		apt,
		description,
		bedrooms,
		bathrooms,
		rent,
		deposit,
		availabilityDate,
		location,
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
