import {
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	Stack,
	Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0,
});

function ListingCard({ listing }) {
	const navigate = useNavigate();
	return (
		<Card>
			<Stack direction="row">
				<CardMedia
					component="img"
					height="240"
					image="https://photos.zillowstatic.com/fp/806096a814e9817775d93d0df3d03e55-p_e.jpg"
					alt={listing.location?.name}
					sx={{
						width: '240px',
					}}
				/>
				<Box>
					<CardContent>
						<Typography gutterBottom variant="h5">
							{formatter.format(listing.rent)}/mo
						</Typography>
						{listing.apt && <Typography>Apt {listing.apt}</Typography>}
						<Typography gutterBottom>
							{listing.location?.streetAddress}
						</Typography>
						<Typography color="text.secondary">
							<span style={{ fontWeight: 'bold' }}>{listing.bedrooms}</span> bd
							| <span style={{ fontWeight: 'bold' }}>{listing.bathrooms}</span>{' '}
							ba
							{listing.area && (
								<>
									| <span style={{ fontWeight: 'bold' }}>{listing.area}</span>{' '}
									sqft
								</>
							)}
						</Typography>
					</CardContent>
					<Button
						onClick={() => {
							navigate(`/listings/${listing._id}`);
						}}
					>
						View
					</Button>
				</Box>
			</Stack>
		</Card>
	);
}

export default ListingCard;
