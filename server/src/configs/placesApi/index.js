import axios from 'axios';

export const getLocationDetails = async (placeId, region) => {
	const res = await axios.get(
		`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${
			process.env.GOOGLE_MAPS_API_KEY
		}${region ? `&region=${region}` : ''}`
	);
	return res?.data ?? {};
};

const getPlacesAutoCompleteResponse = async (input, types = 'locality') => {
	const res = await axios.get(
		`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=${types}&region=us&key=${process.env.GOOGLE_MAPS_API_KEY}`
	);
	return res?.data ?? {};
};

export const getLocality = async (placeId) => {
	const { result } = await getLocationDetails(placeId);
	const { geometry, formatted_address: formattedAddress } = result;
	const coordinates = JSON.parse(JSON.stringify(geometry?.viewport));
	return {
		...coordinates,
		placeId,
		formattedAddress,
	};
};

export const getPlacesAutocompleteLocality = async (place, placeId) => {
	const res = await getPlacesAutoCompleteResponse(place);
	if (res.status !== 'OK') return null;
	const locality = res.predictions.find(
		(prediction) => prediction.place_id === placeId
	);
	if (!locality) return null;
	return locality;
};

export const getPlacesAutocompleteLocation = async (place, placeId) => {
	const res = await getPlacesAutoCompleteResponse(
		place,
		'premise|street_address'
	);
	if (res.status !== 'OK') return null;
	const location = res.predictions.find(
		(prediction) => prediction.place_id === placeId
	);
	if (!location) return null;
	return location;
};
