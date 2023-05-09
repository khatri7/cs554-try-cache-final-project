import { Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import image from './404A.gif';

function ErrorPage() {
	const navigate = useNavigate();
	const handleNavigate = () => {
		navigate('/');
	};
	return (
		<div className="notFound__container">
			<div
				style={{
					position: 'fixed',
					inset: 0,
					backgroundColor: '#f0f0f0',
					zIndex: -1,
				}}
			/>
			<div
				className="notFound__content"
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'column',
				}}
			>
				<img src={image} alt="404" style={{ width: '50%' }} />
				<Button
					type="button"
					variant="outlined"
					className="notFound__content__btn"
					onClick={handleNavigate}
				>
					Go To Home Page
				</Button>
			</div>
		</div>
	);
}

export default ErrorPage;
