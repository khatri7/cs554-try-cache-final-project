import { ObjectId } from 'mongodb';
import { applications } from '../../configs/mongodb';
import {
	badRequestErr,
	forbiddenErr,
	internalServerErr,
	isValidObjectId,
	notFoundErr,
	unauthorizedErr,
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
		application.listing?.listedBy?.toString() !== validatedUser._id &&
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
		createApplicationAck.insertedId.toString(),
		validatedUser
	);
	return createdApplication;
};

export const rejectapplication = async (ApplicationId, user) => {
	const validatedUser = isValidUserAuthObj(user);
	if (validatedUser.role !== 'lessor')
		throw forbiddenErr(
			'You cannot udpate this application if you have registered as a tenant'
		);
	const applicationCollection = await applications();
	const application = await getApplicationById(ApplicationId, validatedUser);

	if (application.listing.listedBy !== user.id) {
		unauthorizedErr('incorrect User accessing the application');
	}

	const applicationAck = await applicationCollection.updateOne(
		{ _id: application._id },
		{ $set: { status: applicationStatus.DECLINED } }
	);
	if (!applicationAck.acknowledged || !applicationAck.modifiedCount)
		throw internalServerErr(
			'Could not bookmark the Application. Please try again.'
		);
	const applicationUpdate = await getApplicationById(
		ApplicationId,
		validatedUser
	);
	return applicationUpdate;
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

export const approveApplication = async (
	applicationId,
	text,
	user,
	leaseParam
) => {
	const validatedUser = isValidUserAuthObj(user);

	if (validatedUser.role !== 'lessor')
		throw forbiddenErr(
			'You cannot udpate this application if you have registered as a tenant'
		);

	const applicationCollection = await applications();

	const application = await getApplicationById(applicationId, validatedUser);

	if (application.listing.listedBy.toString() !== validatedUser.id) {
		unauthorizedErr('incorrect User accessing the application');
	}
	const noteObj = application.notes;
	noteObj[applicationStatus.APPROVED] = { text };
	const updatedAt = new Date();
	if (!leaseParam) throw badRequestErr('Lease is required');
	if (leaseParam.mimetype !== 'application/pdf')
		throw badRequestErr('Lease has to be of type PDF');
	const docKey = `applications/${applicationId.toString()}/lease/${
		leaseParam.originalname
	}`;
	const lease = await upload(docKey, leaseParam.buffer, leaseParam.mimetype);
	const applicationAck = await applicationCollection.updateOne(
		{ _id: application._id },
		{
			$set: {
				status: applicationStatus.APPROVED,
				updatedAt,
				lease,
				notes: noteObj,
			},
		}
	);
	if (!applicationAck.acknowledged || !applicationAck.modifiedCount)
		throw internalServerErr(
			'Could not Update the Application. Please try again.'
		);
	const applicationUpdate = await getApplicationById(
		applicationId,
		validatedUser
	);
	return applicationUpdate;
};

export const completeApplication = async (
	applicationId,
	text,
	user,
	documents
) => {
	const validatedUser = isValidUserAuthObj(user);

	if (validatedUser.role !== 'tenant')
		throw forbiddenErr('You cannot update this information as Lessor');

	const applicationCollection = await applications();

	const application = await getApplicationById(applicationId, validatedUser);

	if (application.listing.listedBy.toString() !== validatedUser.id) {
		unauthorizedErr('incorrect User accessing the application');
	}

	const noteObj = application.notes;
	const updatedAt = new Date();
	if (!documents) throw badRequestErr('Lease is required');
	const docsUrl = [];
	await Promise.all(
		documents.map(async (document) => {
			if (document.mimetype !== 'application/pdf')
				throw badRequestErr('Lease has to be of type PDF');
			const docKey = `applications/${applicationId.toString()}/COMPLETED/${
				document.originalname
			}`;
			docsUrl.push(await upload(docKey, document.buffer, document.mimetype));
		})
	);
	noteObj[applicationStatus.COMPLETED] = { text, documents: docsUrl };
	const applicationAck = await applicationCollection.updateOne(
		{ _id: application._id },
		{
			$set: {
				status: applicationStatus.COMPLETED,
				updatedAt,
				notes: noteObj,
			},
		}
	);
	if (!applicationAck.acknowledged || !applicationAck.modifiedCount)
		throw internalServerErr(
			'Could not Update the Application. Please try again.'
		);
	const applicationUpdate = await getApplicationById(
		applicationId,
		validatedUser
	);
	return applicationUpdate;
};
