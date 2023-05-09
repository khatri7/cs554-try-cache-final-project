import { User } from '.';

export interface Application {
	_id: string;
	listing: Listing;
	terms: string | null;
	createdAt: Date;
	updatedAt: number;
	status: string;
	tenant: User;
	notes: Notes;
	paymentSessionId: string;
}

interface Listing {
	_id: string;
	streetAddress: string;
	apt: number | null;
	listedBy: string;
}

interface Notes {
	REVIEW: Review;
	APPROVED: Approved;
	COMPLETED: Completed;
}

interface Approved {
	text: string;
}

interface Completed {
	text: string;
	documents: string[];
	lease: string;
}

interface Review {
	document: string;
	text: string;
	viewed: boolean;
}
