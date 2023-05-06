import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Stack,
	Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Application } from 'utils/types/application';

const ApplicationCard: React.FC<{ application: Application }> = ({
	application,
}) => {
	const navigate = useNavigate();
	return (
		<Card>
			<Stack direction="row">
				<Box>
					<CardContent>
						<Stack direction="row">
							<Box>
								<Typography>{application.listing.streetAddress}</Typography>
								{application.listing.apt && (
									<Typography>Apt {application.listing.apt}</Typography>
								)}
							</Box>
							<Box>
								<Chip label={application.status} variant="outlined" />
							</Box>
						</Stack>
					</CardContent>
					<Button
						onClick={() => {
							navigate(`/applications/${application._id}`);
						}}
					>
						View
					</Button>
				</Box>
			</Stack>
		</Card>
	);
};

export default ApplicationCard;
