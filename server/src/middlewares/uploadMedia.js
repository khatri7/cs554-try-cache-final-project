import multer from 'multer';

const FIVE_MB = 1024 * 1024 * 5;

export const uploadMedia = (field) => {
	const upload = multer({
		limits: {
			fileSize: FIVE_MB,
		},
	}).single(field || 'file');
	return (req, res, next) => {
		upload(req, res, (err) => {
			if (err) res.status(400).json({ message: err.message });
			else next();
		});
	};
};

export const uploadMedias = (field) => {
	const upload = multer({
		limits: {
			fileSize: FIVE_MB,
		},
	}).array(field || 'file', 5);
	return (req, res, next) => {
		upload(req, res, (err) => {
			if (err) res.status(400).json({ message: err.message });
			else next();
		});
	};
};
