import React from 'react';
import './homePage.scss';
import PlacesAutocomplete from 'components/PlacesAutocomplete';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Suggestion } from 'use-places-autocomplete';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'hooks';
import { errorAlert } from 'store/alert';
import useQuery from 'hooks/useQuery';

const Home: React.FC<{}> = () => {
	const navigate = useNavigate();
	const handleSearch = (location: Suggestion | null) => {
		if (location)
			navigate('/listings', {
				state: { location },
			});
	};
	const dispatch = useAppDispatch();
	const role = useAppSelector((state) => state.user.value?.role);
	const { data: popularLocalities } = useQuery<{ localities: Suggestion[] }>(
		'/listings/popular-localities'
	);
	const handleCreateListing = () => {
		if (role !== 'lessor') {
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
				<Typography
					variant="h4"
					component="p"
					className="homepage__search-container__text"
				>
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
			{popularLocalities?.localities &&
				popularLocalities.localities?.length > 0 && (
					<div className="homepage__popular-localities">
						<Typography variant="h5" component="p" gutterBottom>
							Popular Localities
						</Typography>
						<Stack gap={1} alignItems="flex-start">
							{popularLocalities.localities.map((locality) => (
								<Button
									key={locality.place_id}
									onClick={() => {
										handleSearch(locality);
									}}
								>
									{locality.description}
								</Button>
							))}
						</Stack>
					</div>
				)}
		</div>
	);
};

export default Home;
