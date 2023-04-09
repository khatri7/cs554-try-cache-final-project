import express from 'express';
import authRoutes from './auth';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('*', (req, res) => {
	res.status(404).json({ error: 'Not found' });
});

export default router;
