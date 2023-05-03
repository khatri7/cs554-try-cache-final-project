import Axios from 'axios';

const axios = Axios.create({
	baseURL: process.env.REACT_APP_SERVER_URL,
	withCredentials: true,
});

export const handleError = (error) => {
	if (error.response?.data?.message) return error.response.data.message;
	if (error.message) return error.message;
	return error;
};

/**
 *
 * @param {string} endpoint to which the API request is to be made
 * @param {object} params query parameters
 * @returns response data or error response
 */
export const GET = async (endpoint, params = {}, headers = {}) => {
	const { data } = await axios.get(endpoint, { params, headers });
	return data;
};

/**
 *
 * @param {string} endpoint to which the API request is to be made
 * @param {object} body request body
 * @param {object} params query parameters
 * @returns
 */
export const POST = async (endpoint, body = {}, params = {}, headers = {}) => {
	const { data } = await axios.post(endpoint, body, {
		params,
		headers,
	});
	return data;
};

/**
 *
 * @param {string} endpoint to which the API request is to be made
 * @param {object} body request body
 * @param {object} params query parameters
 * @returns
 */
export const PUT = async (endpoint, body = {}, params = {}, headers = {}) => {
	const { data } = await axios.put(endpoint, body, {
		params,
		headers,
	});
	return data;
};

/**
 *
 * @param {string} endpoint to which the API request is to be made
 * @param {object} body request body
 * @param {object} params query parameters
 * @returns
 */
export const PATCH = async (endpoint, body = {}, params = {}, headers = {}) => {
	const { data } = await axios.patch(endpoint, body, {
		params,
		headers,
	});
	return data;
};

/**
 *
 * @param {string} endpoint to which the API request is to be made
 * @param {object} body request body
 * @param {object} params query parameters
 * @returns
 */
export const DELETE = async (
	endpoint,
	body = {},
	params = {},
	headers = {}
) => {
	const { data } = await axios.delete(endpoint, {
		data: body,
		params,
		headers,
	});
	return data;
};

/**
 * Types of axios request possible
 * @typedef {('GET'|'POST'|'PUT'|'DELETE' | 'PATCH')} requestType
 */

export const requestTypes = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
	PATCH: 'PATCH',
};

Object.freeze(requestTypes);

export const getListings = (params) => GET('/listings', params);

export const login = (userLoginObj) => POST('/auth/login', userLoginObj);

export const createUser = (user) => POST('/auth/signup', user);

export const initialReq = () => POST('/auth');

export const logout = () => POST('/auth/logout');

export const createApplication = (applicationBody) => {
	const formData = new FormData();
	Object.entries(applicationBody).forEach((item) => {
		formData.append(item[0], item[1]);
	});
	return POST(
		'/applications',
		formData,
		{},
		{ 'Content-Type': 'multipart/form-data' }
	);
};

export const declineApplication = (applicationId) =>
	POST(`/applications/${applicationId}/lessor/reject`);

export const approveApplication = (applicationId, approveApplicationBody) => {
	const formData = new FormData();
	Object.entries(approveApplicationBody).forEach((item) => {
		formData.append(item[0], item[1]);
	});
	return POST(
		`/applications/${applicationId}/lessor/approve`,
		formData,
		{},
		{ 'Content-Type': 'multipart/form-data' }
	);
};

export const completeApplication = (applicationId, completeApplicationBody) => {
	const formData = new FormData();
	Object.entries(completeApplicationBody).forEach((item) => {
		if (Array.isArray(item[1])) {
			item[1].forEach((listItem) => {
				formData.append(item[0], listItem);
			});
		} else formData.append(item[0], item[1]);
	});
	formData.append('successUrl', window.location.href);
	formData.append('cancelUrl', window.location.href);
	return POST(
		`/applications/${applicationId}/tenant/complete`,
		formData,
		{},
		{ 'Content-Type': 'multipart/form-data' }
	);
};

export const makePayment = (applicationId) =>
	POST(
		`/applications/${applicationId}/payment?successUrl=${window.location.href}&cancelUrl=${window.location.href}`
	);
