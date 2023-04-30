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

const tableHeaders = ['Listing', 'Applied', 'Last Updated', 'Status', ''];

const chipColor = {
	REVIEW: 'warning',
	DECLINED: 'error',
	APPROVED: 'success',
	COMPLETED: 'success',
};

function MyApplications() {
	const { loading, error, data } = useQuery('/applications/my-applications');

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
					{(data.applications || []).map((application) => (
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
										application.status === 'COMPLETED'
											? 'contained'
											: 'outlined'
									}
								/>
							</TableCell>
							<TableCell>
								<Button endIcon={<OpenInNew />}>View</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Box>
	);
}

export default MyApplications;
