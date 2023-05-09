export interface Listing {
	_id: string;
	listedBy: string;
	apt: number | null;
	squareFoot: number;
	description: string;
	bedrooms: number;
	bathrooms: number;
	rent: number;
	deposit: number;
	availabilityDate: string;
	location: Location;
	occupied: boolean;
	photos: Array<string | null>;
	petPolicy: string;
	laundry: string;
	parking: string;
}

interface Location {
	name: string;
	placeId: string;
	streetAddress: string;
	url: string;
	vicinity: string;
	addressComponents: AddressComponent[];
	types: string[];
	lat: number;
	lng: number;
	type: string;
	coordinates: number[];
}

interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}
