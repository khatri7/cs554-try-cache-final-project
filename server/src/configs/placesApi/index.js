import axios from 'axios';

export const getLocationDetails = async (placeId) => {
	const res = await axios.get(
		`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.GOOGLE_MAPS_API_KEY}`
	);
	return res?.data ?? {};
};
