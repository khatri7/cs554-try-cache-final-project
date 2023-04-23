import { getDetails, getLatLng } from 'use-places-autocomplete';

export const getLocationDetails = async (location) => {
	if (location) {
		const { place_id: placeId } = location;
		const result = await getDetails({ placeId });
		const {
			name,
			formatted_address: streedAddress,
			url,
			vicinity,
			address_components: addressComponents,
			types,
		} = result;
		const { lat, lng } = getLatLng(result);
		return {
			name,
			placeId,
			streedAddress,
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
		const { geometry } = result;
		const coordinates = JSON.parse(JSON.stringify(geometry?.viewport));
		return coordinates;
	}
	return false;
};
