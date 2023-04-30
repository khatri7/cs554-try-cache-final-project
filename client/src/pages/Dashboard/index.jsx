import React, { useState } from 'react';
import { Box, Stack, Typography, Tab } from '@mui/material';
import { getAllListings, getMyApplications } from 'utils/api-calls';
import ListingCard from 'components/ListingCard';
import ApplicationCard from 'components/ApplicationCard';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

function Dashboard() {
	const [loading, setLoading] = useState(false);
	const [listings, setListings] = useState([]);
	const [applications, setApplications] = useState([]);
	const [value, setValue] = useState('1');

	// useEffect(() => {
	// 	try {
	// 		setLoading(true);
	// 		console.log('here');
	// 		const listingsArr = getAllListings();
	// 		console.log(listingsArr);
	// 		setListings(listingsArr.listings);
	// 	} catch (e) {
	// 		console.error(e);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// }, []);

	const handleChange = async (event, newValue) => {
		console.log('called', newValue);
		if (newValue === '1') {
			try {
				setLoading(true);
				console.log('here');
				const listingsArr = await getAllListings();
				console.log(listingsArr);
				setListings(listingsArr.listings);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		} else if (newValue === '2') {
			try {
				setLoading(true);
				console.log('here');
				const applicationsArr = await getMyApplications();
				console.log(applicationsArr);
				setApplications(applicationsArr.applications);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		}
		setValue(newValue);
	};

	return (
		<Box sx={{ width: '100%', typography: 'body1' }}>
			<TabContext value={value}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
					<TabList onChange={handleChange} aria-label="lab API tabs example">
						<Tab label="Item One" value="1" />
						<Tab label="Item Two" value="2" />
					</TabList>
				</Box>
				<TabPanel value="1">
					{loading && <Typography>Loading...</Typography>}
					{!loading && listings.length === 0 && (
						<Typography>
							Currently there are no listings that you have posted
						</Typography>
					)}
					{!loading && (
						<Stack>
							{listings.map((listing) => (
								<ListingCard key={listing._id} listing={listing} />
							))}
						</Stack>
					)}
				</TabPanel>
				<TabPanel value="2">
					{loading && <Typography>Loading...</Typography>}
					{!loading && listings.length === 0 && (
						<Typography>
							Currently there are no applications for the properties that you
							have listed.
						</Typography>
					)}
					{!loading && (
						<Stack>
							{applications.map((application) => (
								<ApplicationCard
									key={application._id}
									application={application}
								/>
							))}
						</Stack>
					)}
				</TabPanel>
			</TabContext>
		</Box>
	);
}

export default Dashboard;
