import { RequestOptions, Suggestion } from 'use-places-autocomplete';

interface PlacesAutocompleteProps {
	name?: string;
	types?: RequestOptions['types'];
	cacheKey?: string;
	placeholder?: string;
	label?: string;
	onChange: (location: Suggestion) => void;
}

declare const PlacesAutocomplete: React.FC<PlacesAutocompleteProps>;

export default PlacesAutocomplete;
