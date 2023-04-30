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

function ApplicationCard({ application }) {
	const navigate = useNavigate();
	return (
		<Card>
			<Stack direction="row">
				<Box>
					<CardContent>
						<Stack direction="row">
							<Box>
								<Typography>{application.location.streetAddress}</Typography>
								{application.location.apt && (
									<Typography>Apt {application.location.apt}</Typography>
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
}

export default ApplicationCard;
