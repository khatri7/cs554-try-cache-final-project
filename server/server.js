import express from 'express';
import configRoutes from './routes';

const PORT = 3005;

const app = express();

configRoutes(app);

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}!`);
});
