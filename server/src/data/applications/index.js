import { ObjectId } from 'mongodb';
import { applications } from '../../configs/mongodb';
import {
	badRequestErr,
	forbiddenErr,
	internalServerErr,
	isValidArray,
	isValidObjectId,
	notFoundErr,
	unauthorizedErr,
} from '../../utils';
import { isValidUserAuthObj } from '../../utils/users';
import {
	applicationStatus,
	isValidCreateApplicationObj,
} from '../../utils/applications';
import { checkListingOccupied, getListingById } from '../listings';
import { upload } from '../../configs/awsS3';
import { getUserById } from '../users';

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
	const { firstName, lastName, email, phone } = await getUserById(
		application.tenant._id.toString()
	);
	const { occupied } = await getListingById(application.listing._id.toString());
	if (application.status === applicationStatus.PAYMENT_PENDING)
		delete application.notes.COMPLETED;
	return {
		...application,
		listing: {
			...application.listing,
			occupied,
		},
		tenant: {
			...application.tenant,
			firstName,
			lastName,
			email,
			phone,
		},
	};
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
	// const { _id, firstName, lastName, email, phone } = await getUserById(
	// 	validatedUser._id
	// );
	const { listingId, notes } = isValidCreateApplicationObj(applicationObjParam);
	const {
		listedBy,
		apt,
		location: { streetAddress },
		occupied,
	} = await getListingById(listingId);
	if (await checkApplicationExists(validatedUser._id, listingId))
		throw badRequestErr('You already have an application for this listing');
	if (occupied) throw badRequestErr('Listing is off market');
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
		terms: null,
		createdAt: now,
		updatedAt: now,
		status: applicationStatus.REVIEW,
		tenant: {
			_id: new ObjectId(validatedUser._id),
			// firstName,
			// lastName,
			// email,
			// phone,
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

	const now = new Date();

	const applicationAck = await applicationCollection.updateOne(
		{ _id: application._id },
		{ $set: { status: applicationStatus.DECLINED, updatedAt: now } }
	);
	if (!applicationAck.acknowledged || !applicationAck.modifiedCount)
		throw internalServerErr(
			'Could not update the Application. Please try again.'
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
		.sort({ updatedAt: -1 })
		.toArray();
	const applicationsWithTenantInfo = await Promise.all(
		applicationsArr.map(async (app) => {
			const { firstName, lastName, email, phone } = await getUserById(
				app.tenant._id.toString()
			);
			if (app.status === applicationStatus.PAYMENT_PENDING)
				// eslint-disable-next-line no-param-reassign
				delete app.notes.COMPLETED;
			return {
				...app,
				tenant: {
					...app.tenant,
					firstName,
					lastName,
					email,
					phone,
				},
			};
		})
	);
	return applicationsWithTenantInfo;
};

export const approveApplication = async (
	applicationId,
	text,
	user,
	termsParam
) => {
	const validatedUser = isValidUserAuthObj(user);

	if (validatedUser.role !== 'lessor')
		throw forbiddenErr(
			'You cannot update this application if you have registered as a tenant'
		);

	const applicationCollection = await applications();

	const application = await getApplicationById(applicationId, validatedUser);
	await checkListingOccupied(application.listing._id.toString());
	if (application.listing.listedBy.toString() !== validatedUser.id) {
		unauthorizedErr('incorrect User accessing the application');
	}
	const noteObj = application.notes;
	noteObj[applicationStatus.APPROVED] = { text };
	const updatedAt = new Date();
	let terms = null;
	if (termsParam) {
		if (termsParam.mimetype !== 'application/pdf')
			throw badRequestErr('Terms And Conditions has to be of type PDF');
		const docKey = `applications/${applicationId.toString()}/terms/${
			termsParam.originalname
		}`;
		terms = await upload(docKey, termsParam.buffer, termsParam.mimetype);
	}
	const applicationAck = await applicationCollection.updateOne(
		{ _id: application._id },
		{
			$set: {
				status: applicationStatus.APPROVED,
				updatedAt,
				terms,
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
	await checkListingOccupied(application.listing._id.toString());
	if (application.listing.listedBy.toString() !== validatedUser.id) {
		unauthorizedErr('incorrect User accessing the application');
	}

	const noteObj = application.notes;
	const updatedAt = new Date();
	const docsUrl = [];
	if (documents) {
		isValidArray(documents, 'Documents');
		await Promise.all(
			documents?.map(async (document) => {
				if (document.mimetype !== 'application/pdf')
					throw badRequestErr('Document has to be of type PDF');
				const docKey = `applications/${applicationId.toString()}/COMPLETED/${
					document.originalname
				}`;
				docsUrl.push(await upload(docKey, document.buffer, document.mimetype));
			})
		);
	}

	noteObj[applicationStatus.COMPLETED] = { text, documents: docsUrl };
	const applicationAck = await applicationCollection.updateOne(
		{ _id: application._id },
		{
			$set: {
				status: applicationStatus.PAYMENT_PENDING,
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

export const updatePaymentStatus = async (
	applicationId,
	paymentSession,
	currUser
) => {
	const id = isValidObjectId(applicationId);
	const validatedUser = isValidUserAuthObj(currUser);
	const application = await getApplicationById(id, validatedUser);
	const applicationCollection = await applications();
	if (paymentSession.payment_status !== 'paid')
		throw badRequestErr('The payment has not been completed');
	const updatedAt = new Date();
	const applicationAck = await applicationCollection.updateOne(
		{ _id: application._id },
		{
			$set: {
				status: applicationStatus.COMPLETED,
				paymentSessionId: paymentSession.id,
				updatedAt,
			},
		}
	);
	if (!applicationAck.acknowledged || !applicationAck.modifiedCount)
		throw internalServerErr(
			'Could not Update the Application. Please try again.'
		);
	const updatedApplication = await getApplicationById(
		applicationId,
		validatedUser
	);
	return updatedApplication;
};
