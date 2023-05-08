import express from 'express';
import authRoutes from './auth';
import listingRoutes from './listings';
import applicationRoutes from './applications';
import userRoutes from './users';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/listings', listingRoutes);

router.use('/applications', applicationRoutes);

router.use('/users', userRoutes);

router.use('*', (req, res) => {
	res.status(404).json({ error: 'Not found' });
});

export default router;
