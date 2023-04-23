import { Card, CardContent, CardMedia, Stack, Typography } from '@mui/material';
import React from 'react';

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0,
});

function ListingCard({ listing }) {
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
				<CardContent>
					<Typography gutterBottom variant="h5">
						{formatter.format(listing.rent)}/mo
					</Typography>
					{listing.apt && <Typography>Apt {listing.apt}</Typography>}
					<Typography gutterBottom>
						{listing.location?.streetAddress}
					</Typography>
					<Typography color="text.secondary">
						<span style={{ fontWeight: 'bold' }}>{listing.bedrooms}</span> bd |{' '}
						<span style={{ fontWeight: 'bold' }}>{listing.bathrooms}</span> ba
						{listing.area && (
							<>
								| <span style={{ fontWeight: 'bold' }}>{listing.area}</span>{' '}
								sqft
							</>
						)}
					</Typography>
				</CardContent>
			</Stack>
		</Card>
	);
}

export default ListingCard;
