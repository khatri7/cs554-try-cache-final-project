import { ObjectId } from 'mongodb';
import { applications, listings } from '../../configs/mongodb';
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
	isValidAvailabilityDate,
	isValidCreateListingObj,
	isValidSearchAreaQuery,
	isValidUpdateListingObj,
} from '../../utils/listings';
import { isValidUserAuthObj } from '../../utils/users';
import redis from '../../configs/redis';
import { deleteObject, upload } from '../../configs/awsS3';
import {
	getLocality,
	getLocationDetails,
	getPlacesAutocompleteLocality,
} from '../../configs/placesApi';

// One day in seconds
const ONE_DAY = 86400;

export const getListingById = async (idParam) => {
	const id = isValidObjectId(idParam);
	const listingFromCache = await redis.read(`tc_listing_${id}`);
	if (listingFromCache) {
		listingFromCache._id = new ObjectId(listingFromCache._id);
		listingFromCache.listedBy = new ObjectId(listingFromCache.listedBy);
		listingFromCache.photos = listingFromCache.photos.map((photo) => {
			if (photo) return `${photo}?t=${Date.now()}`;
			return photo;
		});
		return listingFromCache;
	}
	const listingsCollection = await listings();
	const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
	if (!listing) throw notFoundErr('No listing found for the provided id');
	listing.photos = listing.photos.map((photo) => {
		if (photo) return `${photo}?t=${Date.now()}`;
		return photo;
	});
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

const updateLocalityCache = async (listing, remove = false) => {
	const localityKeys = await redis.getKeys('tc_locality_*');
	if (remove) {
		let localityToUpdate = await Promise.all(
			localityKeys.map(async (locality) => {
				const localityData = await redis.read(locality);
				const result = localityData?.listings?.includes(listing._id.toString());
				if (result) return locality;
				return false;
			})
		);
		localityToUpdate = localityToUpdate.filter(
			(locality) => locality !== false
		);
		localityToUpdate =
			localityToUpdate.length > 0 ? localityToUpdate[0] : undefined;
		if (localityToUpdate) {
			const localityData = await redis.read(localityToUpdate);
			const updatedListings = localityData?.listings?.filter(
				(cLisitng) => cLisitng !== listing._id.toString()
			);
			await redis.cache(
				localityData,
				{
					...localityData,
					listings: updatedListings,
				},
				{ EX: ONE_DAY },
				true
			);
		}
	} else {
		const listingAddressComponents = listing?.location?.addressComponents;
		if (listingAddressComponents) {
			let localityToUpdate = await Promise.all(
				localityKeys.map(async (locality) => {
					const localityData = await redis.read(locality);
					if (
						!localityData ||
						!localityData.addressComponents ||
						!Array.isArray(localityData.addressComponents)
					)
						return false;
					const result = localityData.addressComponents.every((component) =>
						listingAddressComponents.some(
							(lComponent) =>
								JSON.stringify(component) === JSON.stringify(lComponent)
						)
					);
					if (result) return locality;
					return result;
				})
			);
			localityToUpdate = localityToUpdate.filter(
				(locality) => locality !== false
			);
			localityToUpdate =
				localityToUpdate.length > 0 ? localityToUpdate[0] : undefined;
			if (localityToUpdate) {
				const localityData = await redis.read(localityToUpdate);
				if (localityData?.listings?.indexOf(listing._id.toString()) === -1) {
					const updatedLocalityData = {
						...localityData,
						listings: [...localityData.listings, listing._id.toString()],
					};
					await redis.cache(
						localityToUpdate,
						updatedLocalityData,
						{ EX: ONE_DAY },
						true
					);
				}
			}
		}
	}
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
		squareFoot,
		laundry,
		petPolicy,
		parking,
	} = await isValidCreateListingObj(listingObjParam);
	await checkListingExists(location, apt);
	const listingObj = {
		listedBy: new ObjectId(user._id),
		apt,
		description,
		bedrooms,
		bathrooms,
		rent,
		deposit,
		squareFoot,
		availabilityDate,
		location: {
			...location,
			type: 'Point',
			coordinates: [location.lng, location.lat],
		},
		laundry,
		petPolicy,
		parking,
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
	await redis.cache(
		`tc_listing_${createdListing._id.toString()}`,
		createdListing,
		{},
		true
	);
	await updateLocalityCache(createdListing);
	return createdListing;
};

const getListingsFromCache = async (placeId) => {
	const listingsFromCache = await redis.read(`tc_locality_${placeId}`);
	if (!listingsFromCache) return null;
	const listingIds = listingsFromCache.listings;
	return Promise.all(
		listingIds.map(async (listingId) => {
			const listing = await redis.read(`tc_listing_${listingId}`);
			if (!listing) {
				const listingFromDb = await getListingById(listingId);
				await redis.cache(`tc_listing_${listingId}`);
				return listingFromDb;
			}
			return listing;
		})
	);
};

const cacheListings = async (searchArea, listingsArr) => {
	await redis.cache(
		`tc_locality_${searchArea.placeId}`,
		{
			...searchArea,
			listings: listingsArr.map((listing) => listing._id),
		},
		{ EX: ONE_DAY },
		true
	);
	await Promise.all(
		listingsArr.map(async (listing) => {
			await redis.cache(
				`tc_listing_${listing._id.toString()}`,
				listing,
				{},
				true
			);
		})
	);
};

export const getListings = async (searchAreaParam) => {
	const searchArea = isValidSearchAreaQuery(searchAreaParam);
	const placeDetails = await getLocationDetails(searchArea.placeId, 'us');
	if (placeDetails.status !== 'OK') throw badRequestErr('Invalid Locality');
	if (placeDetails?.result?.address_components)
		searchArea.addressComponents = placeDetails.result.address_components;
	await redis.updatePopularLocalities(searchArea.placeId);
	const cachedListings = await getListingsFromCache(searchArea.placeId);
	if (cachedListings !== null) return cachedListings;
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
	await cacheListings(searchArea, listingsArr);
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
	if (availabilityDate && availabilityDate !== oldListing.availabilityDate)
		isValidAvailabilityDate(availabilityDate);
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
	await redis.cache(
		`tc_listing_${updateListingAck.value._id.toString()}`,
		updateListingAck.value,
		{},
		true
	);
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
	const docKey = `listings/${listing._id.toString()}/image/${pos}`;
	const image = await upload(docKey, document.buffer, document.mimetype);
	const photosArr = listing.photos;
	photosArr[Number.parseInt(pos, 10) - 1] = image;
	const listingsCollection = await listings();
	const updateListingAck = await listingsCollection.findOneAndUpdate(
		{ _id: listing._id },
		{ $set: { photos: photosArr } },
		{ returnDocument: 'after' }
	);
	if (updateListingAck.lastErrorObject.n === 0)
		throw notFoundErr('Listing Not Found');
	await redis.cache(
		`tc_listing_${updateListingAck.value._id.toString()}`,
		updateListingAck.value,
		{},
		true
	);
	return getListingById(id);
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
	if (!photosArr[Number.parseInt(pos, 10) - 1])
		throw badRequestErr('There is no image for given position');
	photosArr[Number.parseInt(pos, 10) - 1] = null;
	const docKey = `listings/${listing._id.toString()}/image/${pos}`;
	await deleteObject(docKey);
	const listingsCollection = await listings();
	const updateListingAck = await listingsCollection.findOneAndUpdate(
		{ _id: listing._id },
		{ $set: { photos: photosArr } },
		{ returnDocument: 'after' }
	);
	if (updateListingAck.lastErrorObject.n === 0)
		throw notFoundErr('Listing Not Found');
	await redis.cache(
		`tc_listing_${updateListingAck.value._id.toString()}`,
		updateListingAck.value,
		{},
		true
	);
	return getListingById(id);
};

const deleteAssociatedApplications = async (listingId) => {
	const id = isValidObjectId(listingId);
	const applicationCollection = await applications();
	const updatedAppCol = await applicationCollection.deleteMany({
		'listing._id': new ObjectId(id),
	});
	return updatedAppCol;
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
	await deleteAssociatedApplications(listingIdParam);
	await redis.delCache(`tc_listing_${oldListing._id.toString()}`);
	await updateLocalityCache(oldListing, true);
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

export const getPopularLocalities = async () => {
	const popularLocalityKeys = await redis.getTopTenPopularLocalities();
	const localities = await Promise.all(
		popularLocalityKeys.map(async (key) => {
			let locality = await redis.read(key);
			const placeId = key.replace('tc_locality_', '');
			if (!locality) {
				locality = await getLocality(placeId);
			}
			const localityName = locality.formattedAddress;
			const autocompleteObj = await getPlacesAutocompleteLocality(
				localityName,
				placeId
			);
			return autocompleteObj;
		})
	);
	return localities.filter((locality) => locality !== null);
};

export const checkListingOccupied = async (idParam) => {
	const id = isValidObjectId(idParam);
	const listingsCollection = await listings();
	const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
	if (!listing) throw notFoundErr('No listing found for the provided id');
	const occupiedStatus = listing.occupied;
	if (occupiedStatus)
		throw badRequestErr(
			'Sorry, The listing is currently Occupied. Please try again later.'
		);
	return false;
};
