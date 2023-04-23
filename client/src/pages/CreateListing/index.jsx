import PlacesAutocomplete from 'components/PlacesAutocomplete';
import React from 'react';
import { getLocationDetails } from 'utils/helpers';

function CreateListing() {
	return (
		<div>
			<PlacesAutocomplete
				onChange={async (location) => {
					const formattedLocation = await getLocationDetails(location);
					console.log(formattedLocation);
				}}
			/>
		</div>
	);
}

export default CreateListing;
