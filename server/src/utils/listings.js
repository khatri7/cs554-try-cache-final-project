import moment from 'moment';
import { badRequestErr, isValidNum, isValidObj, isValidStr } from '.';
import { isValidDateStr } from './users';

const isValidAvailabilityDate = (dateStr) => {
	const momentDate = isValidDateStr(dateStr, 'Availability Date');
	if (!momentDate.isValid()) throw badRequestErr('Invalid Availability Date');
	const difference = moment().diff(momentDate, 'days');
	if (difference > 0)
		throw badRequestErr(
			'Invalid Availability Date: should be present date or a date in future'
		);
	return momentDate.format('MM-DD-YYYY');
};

export const isValidCreateListingObj = (listingObj) => {
	if (!isValidObj(listingObj)) throw badRequestErr('Expected a listing object');
	if (!isValidObj(listingObj.location)) throw badRequestErr('Invalid location');
	return {
		apt: listingObj.apt ? isValidNum(listingObj.apt, 'Apt', 'min', 1) : null,
		description: isValidStr(listingObj.description, 'Description'),
		bedrooms: isValidNum(listingObj.bedrooms, 'Bedrooms', 'min', 0),
		bathrooms: isValidNum(listingObj.bathrooms, 'Bathrooms', 'min', 1),
		rent: isValidNum(listingObj.rent, 'Rent', 'min', 100),
		deposit: isValidNum(listingObj.deposit, 'Deposit', 'min', 0),
		availabilityDate: isValidAvailabilityDate(listingObj.availabilityDate),
		location: listingObj.location,
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
