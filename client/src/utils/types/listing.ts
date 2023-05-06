export interface Listing {
	_id: string;
	listedBy: string;
	apt: number | null;
	area?: number;
	description: string;
	bedrooms: number;
	bathrooms: number;
	rent: number;
	deposit: number;
	availabilityDate: string;
	location: Location;
	occupied: boolean;
	photos: any[];
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
