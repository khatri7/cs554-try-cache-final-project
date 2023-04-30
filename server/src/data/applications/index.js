import { ObjectId } from 'mongodb';
import { applications } from '../../configs/mongodb';
import {
	badRequestErr,
	forbiddenErr,
	internalServerErr,
	isValidObjectId,
	notFoundErr,
} from '../../utils';
import { isValidUserAuthObj } from '../../utils/users';
import {
	applicationStatus,
	isValidCreateApplicationObj,
} from '../../utils/applications';
import { getListingById } from '../listings';
import { getUserById } from '../users';
import { upload } from '../../configs/awsS3';

export const getApplicationById = async (idParam, currUser) => {
	const id = isValidObjectId(idParam);
	const validatedUser = isValidUserAuthObj(currUser);
	const applicationsCollection = await applications();
	const application = await applicationsCollection.findOne({
		_id: new ObjectId(id),
	});
	if (!application)
		throw notFoundErr('No application found for the provided id');
	if (
		application.listing?.listedBy?.toString() !== validatedUser._id ||
		application.tenant?._id?.toString() !== validatedUser._id
	)
		throw forbiddenErr('You are not allowed to view this application');
	return application;
};

const checkApplicationExists = async (tenantId, listingId) => {
	const applicationsCollection = await applications();
	const application = await applicationsCollection.findOne({
		'listing._id': new ObjectId(listingId),
		'tenant._id': new ObjectId(tenantId),
	});
	if (!application) return false;
	return true;
};

export const createApplication = async (
	applicationObjParam,
	user,
	documentParam
) => {
	const validatedUser = isValidUserAuthObj(user);
	if (validatedUser.role !== 'tenant')
		throw forbiddenErr(
			'You cannot create an application if you have registered as a lessor'
		);
	const { _id, firstName, lastName, email, phone } = await getUserById(
		validatedUser._id
	);
	const { listingId, notes } = isValidCreateApplicationObj(applicationObjParam);
	const {
		listedBy,
		apt,
		location: { streetAddress },
	} = await getListingById(listingId);
	if (await checkApplicationExists(validatedUser._id, listingId))
		throw badRequestErr('You already have an application for this listing');
	const now = new Date();
	let document = null;
	const applicationId = new ObjectId();
	if (documentParam) {
		if (documentParam.mimetype !== 'application/pdf')
			throw badRequestErr('Please upload a single merged document of type PDF');
		const docKey = `applications/${applicationId.toString()}/${
			applicationStatus.REVIEW
		}/${documentParam.originalname}`;
		document = await upload(
			docKey,
			documentParam.buffer,
			documentParam.mimetype
		);
	}
	const newApplicationObj = {
		_id: applicationId,
		listing: {
			_id: new ObjectId(listingId),
			streetAddress,
			apt,
			listedBy,
		},
		lease: null,
		createdAt: now,
		updatedAt: now,
		status: applicationStatus.REVIEW,
		tenant: {
			_id,
			firstName,
			lastName,
			email,
			phone,
		},
		notes: {
			[applicationStatus.REVIEW]: {
				document,
				text: notes,
				viewed: false,
			},
		},
	};
	const applicationsCollection = await applications();
	const createApplicationAck = await applicationsCollection.insertOne(
		newApplicationObj
	);
	if (!createApplicationAck?.acknowledged || !createApplicationAck?.insertedId)
		throw internalServerErr('Could not create application. Please try again');
	const createdApplication = await getApplicationById(
		createApplicationAck.insertedId.toString()
	);
	return createdApplication;
};

export const getUserApplications = async (currUser) => {
	const validatedUser = isValidUserAuthObj(currUser);
	const applicationsCollection = await applications();
	let filterKey = 'listing.listedBy';
	if (validatedUser.role === 'tenant') filterKey = 'tenant._id';
	const applicationsArr = await applicationsCollection
		.find({
			[filterKey]: new ObjectId(validatedUser._id),
		})
		.toArray();
	return applicationsArr;
};
