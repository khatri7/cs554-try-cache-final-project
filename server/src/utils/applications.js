import {
	badRequestErr,
	isValidObj,
	isValidStr,
	isValidObjectId,
	isValidArray,
} from '.';

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

export const isValidLessorObj = (applicaitonObj) => {
	if (!isValidObj(applicaitonObj))
		throw badRequestErr('Expected a Application object');

	return {
		description: isValidStr(applicaitonObj.description, 'Description '),
		applicantId: isValidObjectId(applicaitonObj.applicantId, 'applicantId'),
		propertyId: isValidObjectId(applicaitonObj.propertyId, 'propertyId'),
		documentArray: isValidArray(applicaitonObj.documentArray, 'documentArray'), // pass empty array for now
		applicationFee: false,
		status: 'review',
		// applicationFee: isBoolean(applicaitonObj.applicationFee, 'applicationFee'),
		// status: isValidStatus(applicaitonObj.status, 'status'),
		// serviceRequest: isValidServiceRequest(
		// 	applicaitonObj.description,
		// 	'Description'
		// ),
	};
};
