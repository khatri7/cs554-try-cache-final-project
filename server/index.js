import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './src/routes';
import customErrorHandler from './src/middlewares/customErrorHanler';

const FOUR_DAYS = 345600000;

dotenv.config();

const app = express();

app.use(
	cors({
		origin: process.env.CLIENT_URL || 'http://localhost:3000',
		credentials: true,
	})
);
app.use(express.json());
app.use(cookieParser());

/**
 * if token exists, extend it by 4 days
 */
app.use((req, res, next) => {
	if (req.cookies.token && req.url !== '/auth/logout') {
		res.cookie('token', req.cookies.token, {
			maxAge: FOUR_DAYS,
			httpOnly: true,
			sameSite: 'lax',
		});
	}
	next();
});

app.use('/', routes);

app.use(customErrorHandler);

app.listen(process.env.SERVER_PORT || 4000, () => {
	console.log(`🚀 Server started on port ${process.env.SERVER_PORT || 4000}!`);
});
