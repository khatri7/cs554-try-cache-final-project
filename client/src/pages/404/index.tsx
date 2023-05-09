import { Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import image from './404A.gif';
import './404.scss';

const ErrorPage: React.FC<{}> = () => {
	const navigate = useNavigate();
	const handleNavigate = () => {
		navigate('/');
	};
	return (
		<div className="notFound__container">
			<div className="notFound__background" />
			<div className="notFound__content">
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
};

export default ErrorPage;
