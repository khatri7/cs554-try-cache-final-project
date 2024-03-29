import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Tab } from '@mui/material';
import ListingCard from 'components/ListingCard';
import ViewAllApplications from 'components/ViewAllApplications';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import useQuery from 'hooks/useQuery';
import { Listing } from 'utils/types/listing';
import { Application } from 'utils/types/application';
import NoImage from './no-image.jpeg';

function Dashboard() {
	const listingArray: any = useQuery('/listings/mylistings');
	const applicationArray: any = useQuery('/applications/my-applications');
	const [loadingListings, setLoadingListings] = useState(false);
	const [errorListings, setErrorListings] = useState(false);
	const [listings, setListings] = useState([]);
	const [loadingApplications, setLoadingApplications] = useState(false);
	const [imagesLoaded, setImagesLoaded] = useState(false);
	const [errorApplications, setErrorApplications] = useState(false);
	const [applications, setApplications] = useState([]);
	const [value, setValue] = useState('1');
	const [images, setImages] = useState<{ [key: string]: string }>({});

	function addImages() {
		if (listings) {
			listings.forEach((data: Listing) => {
				const listingImages = data.photos.filter(
					(photo) => photo !== null
				) as string[];
				setImages((prev) => ({
					...prev,
					[data._id]: listingImages.length > 0 ? listingImages[0] : NoImage,
				}));
			});
			setImagesLoaded(true);
		}
	}

	useEffect(() => {
		setLoadingListings(listingArray.loading);
		setErrorListings(listingArray.error);
		setListings(listingArray.data?.listings);
	}, [listingArray, listings]);

	useEffect(() => {
		setLoadingApplications(applicationArray.loading);
		setErrorApplications(applicationArray.error);
		setApplications(applicationArray.data?.applications);
	}, [applicationArray]);

	const handleChange = async (
		event: React.SyntheticEvent,
		newValue: string
	) => {
		addImages();
		setValue(newValue);
	};

	return (
		<Box sx={{ width: '100%', typography: 'body1' }}>
			<TabContext value={value}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
					<TabList onChange={handleChange} aria-label="lab API tabs example">
						<Tab label="My Listings" value="1" />
						<Tab label="Applications" value="2" />
					</TabList>
				</Box>
				<TabPanel value="1">
					{errorListings && <Typography>Error: {errorListings}</Typography>}
					{loadingListings && <Typography>Loading...</Typography>}
					{!loadingListings && listings?.length === 0 && (
						<Typography>
							Currently there are no listings that you have posted
						</Typography>
					)}
					{!loadingListings && (
						<Stack gap={4}>
							{listings?.map((listing: Listing) => (
								<ListingCard key={listing._id} listing={listing} />
							))}
						</Stack>
					)}
				</TabPanel>
				<TabPanel value="2">
					{errorApplications && (
						<Typography>Error: {errorApplications}</Typography>
					)}
					{loadingApplications && <Typography>Loading...</Typography>}
					{!loadingApplications && listings?.length === 0 && (
						<Typography>
							Currently there are no applications for the properties that you
							have listed.
						</Typography>
					)}
					{!loadingApplications && imagesLoaded && (
						<Stack gap={4}>
							{applications?.map((application: Application) => (
								<ViewAllApplications
									key={application._id}
									application={application}
									image={images[application.listing._id]}
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
