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
import { Listing } from 'utils/types/listing';
import NoImage from './no-image.jpeg';

export const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0,
});

const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
	const navigate = useNavigate();
	const listingImages = listing.photos.filter(
		(photo) => photo !== null
	) as string[];
	const imageSrc = listingImages.length > 0 ? listingImages[0] : NoImage;
	return (
		<Card raised>
			<Stack direction="row">
				<CardMedia
					component="img"
					height="240"
					image={imageSrc}
					alt={listing.location?.name}
					sx={{
						width: '240px',
					}}
				/>
				<Box>
					<CardContent>
						<Typography
							gutterBottom
							style={{ fontSize: 20, fontWeight: 'bold' as 'bold' }}
						>
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
							{listing.squareFoot && (
								<>
									|{' '}
									<span style={{ fontWeight: 'bold' }}>
										{listing.squareFoot}
									</span>{' '}
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
};

export default ListingCard;
