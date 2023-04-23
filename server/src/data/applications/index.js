import { ObjectId } from 'mongodb';
import { applications } from '../../configs/mongodb';
import {
	// badRequestErr,
	forbiddenErr,
	internalServerErr,
	isValidObjectId,
	notFoundErr,
} from '../../utils';
// import { isValidCreateApplicationObj } from '../../utils/applications';
import { isValidUserAuthObj } from '../../utils/users';

export const getApplicationById = async (idParam) => {
	const id = isValidObjectId(idParam);
	const applicationsCollection = await applications();
	const application = await applicationsCollection.findOne({
		_id: new ObjectId(id),
	});
	if (!application)
		throw notFoundErr('No application found for the provided id');
	return application;
};

export const createApplication = async (applicationObjParam, user) => {
	const validatedUser = isValidUserAuthObj(user);
	if (validatedUser.role !== 'tenant')
		throw forbiddenErr(
			'You cannot create an application if you have registered as a manager'
		);

	const applicationsCollection = await applications();
	const createApplicationAck = await applicationsCollection.insertOne(
		applicationObjParam
	);

	if (!createApplicationAck?.acknowledged || !createApplicationAck?.insertedId)
		throw internalServerErr('Could not create application. Please try again');
	const createdApplication = await getApplicationById(
		createApplicationAck.insertedId.toString()
	);
	return createdApplication;
};
