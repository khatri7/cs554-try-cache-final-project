// import moment from 'moment';
import {
	badRequestErr,
	isValidObj,
	isValidStr,
	isValidObjectId,
	isValidArray,
	// isBoolean,
} from '.';

// const validStatuses = ['review', 'accepted', 'rejected'];

// const isValidStatus = (status) => {
// 	if (!validStatuses.includes(status))
// 		throw badRequestErr('Incorrect Status Application passed');
// 	return status;
// };

export const isValidCreateApplicationObj = (applicaitonObj) => {
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
