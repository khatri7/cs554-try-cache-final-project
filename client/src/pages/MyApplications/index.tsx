import { OpenInNew } from '@mui/icons-material';
import {
	Box,
	Button,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import useQuery from 'hooks/useQuery';
import moment from 'moment';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Application } from 'utils/types/application';

const tableHeaders = ['Listing', 'Applied', 'Last Updated', 'Status', ''];

type Color = 'warning' | 'error' | 'success';

export const chipColor: { [key in Application['status']]: Color } = {
	REVIEW: 'warning',
	DECLINED: 'error',
	APPROVED: 'success',
	PAYMENT_PENDING: 'error',
	COMPLETED: 'success',
};

function MyApplications() {
	const { loading, error, data } = useQuery('/applications/my-applications');

	const navigate = useNavigate();

	if (loading) return <Typography>Loading...</Typography>;

	if (error || !data.applications) return <Typography>{error}</Typography>;

	return (
		<Box>
			<Typography
				variant="h4"
				component="h1"
				textTransform="uppercase"
				gutterBottom
			>
				My Applications
			</Typography>
			{/* {
                data.applications.
            } */}
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						{tableHeaders.map((header) => (
							<TableCell key={header}>
								<Typography variant="h6">{header}</Typography>
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{(data.applications || []).map((application: Application) => (
						<TableRow key={application._id}>
							<TableCell>
								<Typography>{application.listing?.streetAddress}</Typography>
								{application.listing?.apt && (
									<Typography>Apt {application.listing.apt}</Typography>
								)}
							</TableCell>
							<TableCell>
								{moment(application.createdAt).format('LL')}
							</TableCell>
							<TableCell>
								{moment(application.updatedAt).format('LL')}
							</TableCell>
							<TableCell>
								<Chip
									label={application.status}
									color={chipColor[application.status] || 'primary'}
									variant={
										application.status === 'COMPLETED' ? 'filled' : 'outlined'
									}
								/>
							</TableCell>
							<TableCell>
								<Button
									onClick={() => {
										navigate(`/applications/${application._id}`);
									}}
									endIcon={<OpenInNew />}
								>
									View
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Box>
	);
}

export default MyApplications;
