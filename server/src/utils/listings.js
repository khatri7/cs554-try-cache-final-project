import moment from 'moment';
import xss from 'xss';
import {
	badRequestErr,
	deepEquality,
	isValidLaundry,
	isValidNum,
	isValidObj,
	isValidParking,
	isValidPetPolicy,
	isValidStr,
} from '.';
import { isValidDateStr } from './users';
import {
	getLocationDetails,
	getPlacesAutocompleteLocation,
} from '../configs/placesApi';

export const isValidAvailabilityDate = (dateStr) => {
	const momentDate = isValidDateStr(xss(dateStr), 'Availability Date');
	if (!momentDate.isValid()) throw badRequestErr('Invalid Availability Date');
	const difference = moment().diff(momentDate, 'days');
	if (difference > 0)
		throw badRequestErr(
			'Invalid Availability Date: should be present date or a date in future'
		);
	return momentDate.format('MM-DD-YYYY');
};

const isValidListingLocation = async (location) => {
	if (!isValidObj(location)) throw badRequestErr('Invalid location');
	if (!location.placeId || !location.streetAddress)
		throw badRequestErr('Invalid Location');
	const textSearchResult = await getPlacesAutocompleteLocation(
		location.streetAddress.trim(),
		location.placeId.trim()
	);
	if (!textSearchResult) throw badRequestErr('Invalid Location');
	const res = await getLocationDetails(location.placeId.trim());
	if (res.status !== 'OK') throw badRequestErr('Invalid Location');
	const {
		place_id: placeId,
		name,
		formatted_address: streetAddress,
		url,
		vicinity,
		address_components: addressComponents,
		types,
	} = res.result;
	const { lat, lng } = JSON.parse(
		JSON.stringify(res.result?.geometry?.location)
	);
	if (
		!deepEquality(
			{
				name,
				placeId,
				streetAddress,
				url,
				vicinity,
				addressComponents,
				types,
				lat,
				lng,
			},
			location
		)
	) {
		throw badRequestErr('Invalid location');
	}
	return {
		name,
		placeId,
		streetAddress,
		url,
		vicinity,
		addressComponents,
		types,
		lat,
		lng,
	};
};

export const isValidCreateListingObj = async (listingObj) => {
	if (!isValidObj(listingObj)) throw badRequestErr('Expected a listing object');
	const location = await isValidListingLocation(listingObj.location);
	return {
		apt:
			listingObj.apt !== undefined &&
			listingObj.apt !== '' &&
			listingObj.apt !== null
				? isValidNum(listingObj.apt, 'Apt', 'min', 1)
				: null,
		description: listingObj.description?.trim()
			? isValidStr(xss(listingObj.description), 'Description')
			: '',
		bedrooms:
			isValidNum(listingObj.bedrooms, 'Bedrooms', 'min', 0) &&
			isValidNum(listingObj.bedrooms, 'Bedrooms', 'max', 20),
		bathrooms:
			isValidNum(listingObj.bathrooms, 'Bathrooms', 'min', 1) &&
			isValidNum(listingObj.bathrooms, 'Bathrooms', 'max', 20),

		rent: isValidNum(listingObj.rent, 'Rent', 'min', 100),
		deposit: isValidNum(listingObj.deposit, 'Deposit', 'min', 0),
		availabilityDate: isValidAvailabilityDate(listingObj.availabilityDate),
		location,
		laundry: isValidLaundry(xss(listingObj.laundry)),
		petPolicy: isValidPetPolicy(xss(listingObj.petPolicy)),
		parking: isValidParking(xss(listingObj.parking)),
		squareFoot:
			listingObj.squareFoot !== undefined &&
			listingObj.squareFoot !== '' &&
			listingObj.squareFoot !== null
				? isValidNum(listingObj.squareFoot, 'SquareFoot', 'min', 100)
				: null,
	};
};

const isValidLongitude = (lng) =>
	typeof lng === 'number' && Number.isFinite(lng) && lng <= 180 && lng >= -180;
const isValidLatitute = (lat) =>
	typeof lat === 'number' && Number.isFinite(lat) && lat <= 90 && lat >= -90;

export const isValidSearchAreaQuery = ({
	north,
	east,
	south,
	west,
	placeId,
	formattedAddress,
}) => {
	isValidStr(placeId, 'placeId');
	isValidStr(formattedAddress, 'formattedAddress');
	const searchArea = { north, east, south, west, placeId, formattedAddress };
	if (typeof north === 'string') searchArea.north = parseFloat(north.trim());
	if (typeof east === 'string') searchArea.east = parseFloat(east.trim());
	if (typeof south === 'string') searchArea.south = parseFloat(south.trim());
	if (typeof west === 'string') searchArea.west = parseFloat(west.trim());
	if (
		!isValidLongitude(searchArea.west) ||
		!isValidLatitute(searchArea.south) ||
		!isValidLongitude(searchArea.east) ||
		!isValidLatitute(searchArea.north)
	)
		throw badRequestErr('Invalid Search area coordinates');
	return searchArea;
};

export const isValidUpdateListingObj = (listingObj) => {
	if (!isValidObj(listingObj)) throw badRequestErr('Expected a listing object');
	return {
		description: listingObj.description
			? isValidStr(xss(listingObj.description), 'Description')
			: null,
		rent: listingObj.rent
			? isValidNum(listingObj.rent, 'Rent', 'min', 100)
			: null,
		deposit: listingObj.deposit
			? isValidNum(listingObj.deposit, 'Deposit', 'min', 0)
			: null,
		availabilityDate: listingObj.availabilityDate
			? isValidDateStr(
					xss(listingObj.availabilityDate),
					'Availability Date'
			  ).format('MM-DD-YYYY')
			: null,
		occupied: listingObj.occupied ? listingObj.occupied : null,
	};
};
