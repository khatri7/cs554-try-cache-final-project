import React from 'react';
import './homePage.scss';
import PlacesAutocomplete from 'components/PlacesAutocomplete';
import { Card, CardContent, Typography } from '@mui/material';
import { Suggestion } from 'use-places-autocomplete';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'hooks';
import { errorAlert } from 'store/alert';

const Home: React.FC<{}> = () => {
	const navigate = useNavigate();
	const handleSearch = (location: Suggestion) => {
		navigate('/listings', {
			state: { location },
		});
	};
	const dispatch = useAppDispatch();
	const role = useAppSelector((state) => state.user.value?.role);
	const handleCreateListing = () => {
		if (role !== 'tenant') {
			dispatch(
				errorAlert('You need to be logged in as a lessor to create a listing')
			);
			navigate('/login');
		} else {
			navigate('/listings/create');
		}
	};
	const handleFindListings = () => {
		navigate('/listings');
	};
	const handleViewApplications = () => {
		if (role === 'tenant') {
			navigate('/my-applications');
		} else if (role === 'lessor') {
			navigate('/dashboard');
		} else {
			dispatch(errorAlert('You must be logged in to view your applications'));
			navigate('/login');
		}
	};
	return (
		<div className="homepage">
			<div className="homepage__search-container">
				<div className="homepage__search-container--overlay" />
				<Typography variant="h4" className="homepage__search-container__text">
					Find Your Perfect Home
				</Typography>
				<div className="homepage__search-container__search-bar">
					<PlacesAutocomplete
						types={['locality']}
						cacheKey="locality"
						label="Enter a Locality"
						placeholder="Start typing name of a locality"
						onChange={handleSearch}
					/>
				</div>
			</div>
			<div className="homepage__cards-container">
				{role !== 'lessor' && (
					<Card className="homepage__cards-container__card">
						<CardContent className="homepage__cards-container__card-content">
							<Typography variant="h5" component="p">
								Rent a Home
							</Typography>
							<button
								type="button"
								className="homepage__cards-container__card-btn"
								onClick={handleFindListings}
							>
								Rent a Home
							</button>
						</CardContent>
					</Card>
				)}
				{role !== 'tenant' && (
					<Card className="homepage__cards-container__card">
						<CardContent className="homepage__cards-container__card-content">
							<Typography variant="h5" component="p">
								Find Tenants
							</Typography>
							<button
								type="button"
								className="homepage__cards-container__card-btn"
								onClick={handleCreateListing}
							>
								List Property
							</button>
						</CardContent>
					</Card>
				)}
				{role && (
					<Card className="homepage__cards-container__card">
						<CardContent className="homepage__cards-container__card-content">
							<Typography variant="h5" component="p">
								{role === 'tenant' ? 'My ' : ''}Applications
							</Typography>
							<button
								type="button"
								className="homepage__cards-container__card-btn"
								onClick={handleViewApplications}
							>
								View Applications
							</button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
};

export default Home;
