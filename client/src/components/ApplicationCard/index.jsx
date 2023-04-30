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

function ApplicationCard({ application }) {
	const navigate = useNavigate();
	return (
		<Card>
			<Stack direction="row">
				<CardMedia
					component="img"
					height="240"
					image="https://photos.zillowstatic.com/fp/806096a814e9817775d93d0df3d03e55-p_e.jpg"
					alt={application.listing.streetAddress}
					sx={{
						width: '240px',
					}}
				/>
				<Box>
					<CardContent>
						<Typography gutterBottom variant="h5">
							Applicant Name: {application.tenant.firstName}{' '}
							{application.tenant.lastName}
						</Typography>
						<Typography gutterBottom>
							Email Id:{' '}
							{application.tenant.email ? application.tenant.email : 'N/A'}
						</Typography>
						<Typography gutterBottom>
							Phone Number:{' '}
							{application.tenant.phone ? application.tenant.phone : 'N/A'}
						</Typography>
						<Typography gutterBottom>Status: {application.status}</Typography>
						{application.listing.apt && (
							<Typography>Apt {application.listing.apt}</Typography>
						)}
						<Typography gutterBottom>
							{application.listing.streetAddress}
						</Typography>
					</CardContent>
					<Button
						onClick={() => {
							navigate(`/applications/${application._id}`);
						}}
					>
						View Application
					</Button>
				</Box>
			</Stack>
		</Card>
	);
}

export default ApplicationCard;
