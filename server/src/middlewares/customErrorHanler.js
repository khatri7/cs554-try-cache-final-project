import { sendErrResp } from '../utils';

const customErrorHandler = (error, req, res, next) => {
	if (res.headersSent) {
		return next(error);
	}
	return sendErrResp(res, error);
};

export default customErrorHandler;
