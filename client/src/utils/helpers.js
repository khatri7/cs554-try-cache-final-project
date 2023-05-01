import moment from 'moment';
import { initializeApp } from 'store/app';
import { setUser } from 'store/user';
import { getDetails, getLatLng } from 'use-places-autocomplete';
import { initialReq } from './api-calls';

export const getLocationDetails = async (location) => {
	if (location) {
		const { place_id: placeId } = location;
		const result = await getDetails({ placeId });
		const {
			name,
			formatted_address: streetAddress,
			url,
			vicinity,
			address_components: addressComponents,
			types,
		} = result;
		const { lat, lng } = getLatLng(result);
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
	}
	return false;
};

export const getSelectedAreaCoordinates = async (location) => {
	if (location) {
		const { place_id: placeId } = location;
		const result = await getDetails({ placeId });
		const { geometry, formatted_address: formattedAddress } = result;
		const coordinates = JSON.parse(JSON.stringify(geometry?.viewport));
		return {
			...coordinates,
			placeId,
			formattedAddress,
		};
	}
	return false;
};

/**
 *
 * @param {string} char
 * @returns {boolean} if the character provided is a number
 */
export const isNumberChar = (char) => char >= '0' && char <= '9';

export const isValidDateStr = (date) => {
	let error = false;
	date.split('').forEach((char) => {
		if (!isNumberChar(char) && char !== '-') error = true;
	});
	if (error) return false;
	let [month, day, year] = date.split('-');
	if (month.length !== 2 || day.length !== 2 || year.length !== 4) return false;
	year = parseInt(year.trim(), 10);
	month = parseInt(month.trim(), 10);
	day = parseInt(day.trim(), 10);
	if (
		!Number.isFinite(year) ||
		!Number.isFinite(month) ||
		!Number.isFinite(day)
	)
		return false;
	const momentDate = moment(
		`${year.toString().padStart(4, '0')}-${month
			.toString()
			.padStart(2, '0')}-${day.toString().padStart(2, '0')}`
	);
	if (!momentDate.isValid()) return false;
	return true;
};

/**
 *
 * @param {string} date in format MM-DD-YYYY
 * @param {string} compareDate in formate MM-DD-YYY
 * @param {('before' | 'after')} comparision before or after the compare date
 */
export const compareDateStr = (date, compareDate, comparision) => {
	const momentDate = moment(date);
	const compareMomentDate = moment(compareDate);
	const diff = compareMomentDate.diff(momentDate, 'days');
	if (comparision === 'before' && diff > 0) return true;
	if (comparision === 'after' && diff < 0) return true;
	return false;
};

export const isFutureDate = (date) => {
	const momentDate = moment(date);
	if (moment().diff(momentDate, 'days') < 0) return true;
	return false;
};

export const isValidDob = (dateParam) => {
	isValidDateStr(dateParam);
	const momentDate = moment(dateParam);
	if (!momentDate.isValid()) return false;
	const difference = moment().diff(momentDate, 'year');
	if (difference < 16 || difference > 100) return false;
	return true;
};

export const autoLogin = async (dispatch) => {
	try {
		const resp = await initialReq();
		if (resp.user) dispatch(setUser(resp.user));
	} finally {
		dispatch(initializeApp());
	}
};

export const isValidDescription = (str) => {
	if (!str) return false;
	if (typeof str !== 'string') return false;
	if (str.trim().length === 0) return false;
	if (str.length > 500) return false;
	return true;
};

export const isValidBedBath = (num) => {
	if (!num) return false;
	if (typeof num !== 'number') return false;
	if (num < 1 || num > 20) return false;
	if (!/^\d+$/.test(num)) return false;
	return true;
};

export const isValidRentDeposit = (num) => {
	if (!num) return false;
	if (typeof num !== 'number') return false;
	if (!/^\d+$/.test(num)) return false;
	return true;
};

export const isValidApt = (num) => {
	if (!num) return false;
	if (typeof num !== 'number') return false;
	if (!/^\d+$/.test(num)) return false;
	return true;
};
