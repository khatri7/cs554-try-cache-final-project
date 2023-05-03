import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';

let s3;

const getEnvVariables = () => {
	return new Promise((resolve) => {
		if (process.env.S3_BUCKET_REGION) {
			resolve();
		} else {
			const checkInterval = setInterval(() => {
				if (process.env.S3_BUCKET_REGION) {
					clearInterval(checkInterval);
					resolve();
				}
			}, 100);
		}
	});
};

const initS3Client = () => {
	const s3BucketRegion = process.env.S3_BUCKET_REGION;
	const s3AccessKey = process.env.S3_ACCESS_KEY;
	const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
	s3 = new S3Client({
		credentials: {
			accessKeyId: s3AccessKey,
			secretAccessKey: s3SecretAccessKey,
		},
		region: s3BucketRegion,
	});
};

getEnvVariables().then(() => {
	initS3Client();
});

export const upload = async (Key, Body, ContentType, ContentLengthRange) => {
	const params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key,
		Body,
		ContentType,
	};
	if (ContentLengthRange) params.ContentLengthRange = ContentLengthRange;
	const command = new PutObjectCommand(params);
	await s3.send(command);
	return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${Key}`;
};

export const deleteObject = async (Key) => {
	const params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key,
	};
	const command = new DeleteObjectCommand(params);
	const response = await s3.send(command);
	console.log(response);
};
