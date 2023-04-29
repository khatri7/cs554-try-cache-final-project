import { badRequestErr, isValidObj, isValidStr, isValidObjectId } from '.';

export const applicationStatus = {
	REVIEW: 'REVIEW',
	DECLINED: 'DECLINED',
	APPROVED: 'APPROVED',
	COMPLETED: 'COMPLETED',
};

export const isValidCreateApplicationObj = (applicaitonObj) => {
	if (!isValidObj(applicaitonObj))
		throw badRequestErr('Expected a Application object');

	const notes = applicaitonObj.notes
		? isValidStr(applicaitonObj.notes, 'Notes')
		: '';

	return {
		listingId: isValidObjectId(applicaitonObj.listingId, 'Listing Id'),
		notes,
	};
};
