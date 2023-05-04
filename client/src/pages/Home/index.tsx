import React from 'react';
import './homePage.scss';
import PlacesAutocomplete from 'components/PlacesAutocomplete';
import { Card, CardContent, Typography } from '@mui/material';
import { Suggestion } from 'use-places-autocomplete';
import { useNavigate } from 'react-router-dom';

const Home: React.FC<{}> = () => {
	const navigate = useNavigate();
	const handleSearch = (location: Suggestion) => {
		navigate('/listings', {
			state: { location },
		});
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
				<Card className="homepage__cards-container__card">
					<CardContent>
						<button
							type="button"
							className="homepage__cards-container__card-btn"
						>
							Rent a Home
						</button>
					</CardContent>
				</Card>
				<Card className="homepage__cards-container__card">
					<CardContent>
						<button
							type="button"
							className="homepage__cards-container__card-btn"
						>
							Rent a Home
						</button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Home;
