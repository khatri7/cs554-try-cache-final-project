import Axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const axios: AxiosInstance = Axios.create({
	baseURL: process.env.REACT_APP_SERVER_URL,
	withCredentials: true,
});

export const handleError = (error: any | AxiosError) => {
	if (error.response?.data?.message) return error.response.data.message;
	if (error.message) return error.message;
	return error;
};

export const GET = async <T = any>(
	endpoint: string,
	params = {},
	headers = {}
): Promise<AxiosResponse<T>['data']> => {
	const { data } = await axios.get<T>(endpoint, { params, headers });
	return data;
};

export const POST = async (
	endpoint: string,
	body = {},
	params = {},
	headers = {}
): Promise<AxiosResponse['data']> => {
	const { data } = await axios.post(endpoint, body, {
		params,
		headers,
	});
	return data;
};

export const PUT = async (
	endpoint: string,
	body = {},
	params = {},
	headers = {}
): Promise<AxiosResponse['data']> => {
	const { data } = await axios.put(endpoint, body, {
		params,
		headers,
	});
	return data;
};

export const PATCH = async (
	endpoint: string,
	body = {},
	params = {},
	headers = {}
): Promise<AxiosResponse['data']> => {
	const { data } = await axios.patch(endpoint, body, {
		params,
		headers,
	});
	return data;
};

export const DELETE = async (
	endpoint: string,
	body = {},
	params = {},
	headers = {}
): Promise<AxiosResponse['data']> => {
	const { data } = await axios.delete(endpoint, {
		data: body,
		params,
		headers,
	});
	return data;
};

export const getListings = (params: { [key: string]: string }) =>
	GET('/listings', params);

export const login = (userLoginObj: { email: string; password: string }) =>
	POST('/auth/login', userLoginObj);

export const createUser = (user: { [key: string]: string }) =>
	POST('/auth/signup', user);

export const initialReq = () => POST('/auth');

export const logout = () => POST('/auth/logout');

export const createApplication = (applicationBody: { [key: string]: any }) => {
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

export const declineApplication = (applicationId: string) =>
	POST(`/applications/${applicationId}/lessor/reject`);

export const approveApplication = (
	applicationId: string,
	approveApplicationBody: { [key: string]: any }
) => {
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

export const completeApplication = (
	applicationId: string,
	completeApplicationBody: { [key: string]: any }
) => {
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

export const makePayment = (applicationId: string) =>
	POST(
		`/applications/${applicationId}/payment?successUrl=${window.location.href}&cancelUrl=${window.location.href}`
	);

export const updateUser = (
	userId: string,
	updateUserObj: {
		[key: string]: string;
	}
) => PATCH(`/users/${userId}`, updateUserObj);
