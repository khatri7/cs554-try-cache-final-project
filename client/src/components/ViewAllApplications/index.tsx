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
import { Application } from 'utils/types/application';

const ViewAllApplications: React.FC<{
	application: Application;
	image: string;
}> = ({ application, image }) => {
	const navigate = useNavigate();
	return (
		<Card>
			<Stack direction="row">
				<CardMedia
					component="img"
					height="240"
					image={image}
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
};

export default ViewAllApplications;
