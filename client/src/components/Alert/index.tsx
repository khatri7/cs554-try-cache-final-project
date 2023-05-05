import { Snackbar, Alert as MuiAlert } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'hooks';
import React from 'react';
import { dismissAlert } from 'store/alert';

const Alert: React.FC<{}> = () => {
	const { open, type, message } = useAppSelector((state) => state.alert);
	const dispatch = useAppDispatch();
	const handleClose = () => {
		dispatch(dismissAlert());
	};
	return (
		<Snackbar
			open={open}
			autoHideDuration={5000}
			onClose={handleClose}
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
		>
			<MuiAlert severity={type || 'info'}>{message}</MuiAlert>
		</Snackbar>
	);
};

export default Alert;
