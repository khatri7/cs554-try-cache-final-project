import moment from 'moment';
import { initializeApp } from 'store/app';
import { setUser } from 'store/user';
import {
	Suggestion,
	getDetails,
	getLatLng,
	GeocodeResult,
} from 'use-places-autocomplete';
import { AppDispatch } from 'store';
import { initialReq } from './api-calls';

export const getLocationDetails = async (location: Suggestion) => {
	if (location) {
		const { place_id: placeId } = location;
		const result = (await getDetails({
			placeId,
		})) as google.maps.places.PlaceResult;
		const {
			name,
			formatted_address: streetAddress,
			url,
			vicinity,
			address_components: addressComponents,
			types,
		} = result;
		const { lat, lng } = getLatLng(result as GeocodeResult);
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

export const getSelectedAreaCoordinates = async (location: Suggestion) => {
	if (location) {
		const { place_id: placeId } = location;
		const result = await getDetails({ placeId });
		const { geometry, formatted_address: formattedAddress } =
			result as google.maps.places.PlaceResult;
		const coordinates = JSON.parse(JSON.stringify(geometry?.viewport));
		return {
			...coordinates,
			placeId,
			formattedAddress,
		};
	}
	return false;
};

export const isNumberChar = (char: string): boolean =>
	char >= '0' && char <= '9';

export const isValidDateStr = (date: string) => {
	let error = false;
	date.split('').forEach((char) => {
		if (!isNumberChar(char) && char !== '-') error = true;
	});
	if (error) return false;
	let [month, day, year]: Array<string | number> = date.split('-');
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
	const difference = moment().diff(momentDate, 'days');
	if (difference > 0) return false;
	return momentDate.format('MM-DD-YYYY');
};

export const compareDateStr = (
	date: string,
	compareDate: string,
	comparision: 'before' | 'after'
): boolean => {
	const momentDate = moment(date);
	const compareMomentDate = moment(compareDate);
	const diff = compareMomentDate.diff(momentDate, 'days');
	if (comparision === 'before' && diff > 0) return true;
	if (comparision === 'after' && diff < 0) return true;
	return false;
};

export const isFutureDate = (date: string) => {
	const momentDate = moment(date);
	if (moment().diff(momentDate, 'days') < 0) return true;
	return false;
};

export const isValidDob = (dateParam: string) => {
	isValidDateStr(dateParam);
	const momentDate = moment(dateParam);
	if (!momentDate.isValid()) return false;
	const difference = moment().diff(momentDate, 'year');
	if (difference < 18 || difference > 100) return false;
	return true;
};

export const autoLogin = async (dispatch: AppDispatch) => {
	try {
		const resp = await initialReq();
		if (resp.user) dispatch(setUser(resp.user));
	} finally {
		dispatch(initializeApp());
	}
};

export const isValidDescription = (str: string) => {
	if (!str) return false;
	if (typeof str !== 'string') return false;
	if (str.trim().length === 0) return false;
	if (str.length > 500) return false;
	return true;
};

export const isValidBedBath = (num: number): boolean => {
	if (!num) return false;
	if (typeof num !== 'number') return false;
	if (num < 1 || num > 20) return false;
	// if (!/^\d+$/.test(num)) return false;
	return true;
};

export const isValidRentDeposit = (num: number): boolean => {
	if (!num) return false;
	if (typeof num !== 'number') return false;
	// if (!/^\d+$/.test(num)) return false;
	return true;
};

export const isValidApt = (num: number): boolean => {
	if (!num) return false;
	if (typeof num !== 'number') return false;
	// if (!/^\d+$/.test(num)) return false;
	return true;
};

export const isValidNum = (
	num: number,
	compareOp?: 'min' | 'max' | 'equal',
	compareVal?: number
): boolean => {
	if (num === undefined) return false;
	if (typeof num !== 'number' || !Number.isFinite(num)) return false;
	// if (!/^\d+$/.test(num)) return false;
	if (compareOp && compareVal) {
		switch (compareOp) {
			case 'min':
				if (num < compareVal) return false;
				break;
			case 'max':
				if (num > compareVal) return false;
				break;
			case 'equal':
				if (num !== compareVal) return false;
				break;
			default:
				break;
		}
	}
	return true;
};

export const isValidStr = (strParam: string): boolean => {
	if (!strParam) return false;
	if (typeof strParam !== 'string') return false;
	const str = strParam.trim();
	if (str.length === 0) return false;
	return true;
};

export const prettifyPhoneString = (phone: string): string => {
	if (phone.length !== 10) return phone;
	const firstThree = phone.substring(0, 3);
	const secondThree = phone.substring(3, 6);
	const lastFour = phone.substring(6);
	let formattedNumber = '';
	formattedNumber += `+1 (${firstThree}) ${secondThree}`;
	if (phone.length > 6) formattedNumber += `-${lastFour}`;
	return formattedNumber;
};
