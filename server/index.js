import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import routes from './src/routes';

const PORT = 4000;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', routes);


app.listen(PORT, () => {
	console.log(`🚀 Server started on port ${PORT}!`);
});
