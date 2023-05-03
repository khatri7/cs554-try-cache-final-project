import { Box, styled, Typography } from '@mui/material';
import { Container } from '@mui/system';
import React from 'react';
import heroIllustration from 'components/Homepage/heroIllustration.png';
import apartments from 'components/Homepage/apartments.jpeg';
import studio from 'components/Homepage/studio.jpeg';
import zillow from 'components/Homepage/zillow.png';
import trulia from 'components/Homepage/trulia.png';
import tuli from 'components/Homepage/tuli.jpeg';
import houses from 'components/Homepage/houses.jpeg';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HotelIcon from '@mui/icons-material/Hotel';
import HouseIcon from '@mui/icons-material/House';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import CustomButton from './StyledButton';
import Navbar from './Navbar';

const ExpandMore = styled((props) => {
	const { expand, ...other } = props;
	return <IconButton {...other} />;
})(({ theme, expand }) => ({
	transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
	marginLeft: 'auto',
	transition: theme.transitions.create('transform', {
		duration: theme.transitions.duration.shortest,
	}),
}));

function Homepage() {
	const [expanded, setExpanded] = React.useState(false);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};
	const CustomBox = styled(Box)(({ theme }) => ({
		display: 'flex',
		justifyContent: 'center',
		gap: theme.spacing(5),
		marginTop: theme.spacing(3),
		[theme.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'center',
			textAlign: 'center',
		},
	}));

	const Title = styled(Typography)(({ theme }) => ({
		fontSize: '64px',
		color: '#000336',
		fontWeight: 'bold',
		margin: theme.spacing(4, 0, 4, 0),
		[theme.breakpoints.down('sm')]: {
			fontSize: '40px',
		},
	}));

	return (
		<Box sx={{ backgroundColor: '#E6F0FF', minHeight: '80vh' }}>
			<Container>
				<Navbar />
				<CustomBox>
					<Box sx={{ flex: '1' }}>
						<Typography
							variant="body2"
							sx={{
								fontSize: '25px',
								color: '#687690',
								fontWeight: 'bold',
								marginTop: '10px',
								marginBottom: '4px',
								textAlign: 'center',
								textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)',
							}}
						>
							Welcome to our CS554 project!
						</Typography>
						<Title variant="h1">
							Discover a place where you&rsquo;ll love to live.
						</Title>

						<CustomButton
							backgroundColor="#0F1B4C"
							color="#fff"
							buttonText="More About Us"
						/>
					</Box>

					<Box sx={{ flex: '1.25' }}>
						<img
							src={heroIllustration}
							alt="heroIllustration "
							style={{ maxWidth: '100%', marginBottom: '4rem' }}
						/>
					</Box>
				</CustomBox>
			</Container>
			<Box
				sa={{
					backgroundColor: '#87CEEB',
					padding: '1rem',
					display: 'flex',
					justifyContent: 'space-around',

					gap: 10,
				}}
			>
				<Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
					<Card sx={{ flex: '1', bgcolor: 'skyblue', maxWidth: 345, m: 2 }}>
						<CardHeader
							avatar={
								<Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
									<ApartmentIcon />
								</Avatar>
							}
							action={
								<IconButton aria-label="settings">
									<MoreVertIcon />
								</IconButton>
							}
							title="Featured Listings"
						/>
						<CardMedia component="img" height="194" image={apartments} />
						<CardContent>
							<Typography variant="body2" color="text.secondary">
								Welcome to our real estate website, where you can find a
								selection of our best featured apartment listings. Our curated
								collection includes stunning apartments in prime locations, with
								high-end amenities and exceptional views. Explore our listings
								and discover your next dream home today
							</Typography>
						</CardContent>
						<CardActions disableSpacing>
							<IconButton aria-label="add to favorites">
								<FavoriteIcon />
							</IconButton>
							<IconButton aria-label="share">
								<ShareIcon />
							</IconButton>
							<ExpandMore
								expand={expanded}
								onClick={handleExpandClick}
								aria-expanded={expanded}
								aria-label="show more"
							>
								<ExpandMoreIcon />
							</ExpandMore>
						</CardActions>
						<Collapse in={expanded} timeout="auto" unmountOnExit>
							<CardContent>
								<Typography paragraph>Method:</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography>
									Set aside off of the heat to let rest for 10 minutes, and then
									serve.
								</Typography>
							</CardContent>
						</Collapse>
					</Card>

					<Card sx={{ flex: '1', bgcolor: 'skyblue', maxWidth: 345, m: 2 }}>
						<CardHeader
							avatar={
								<Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
									<HotelIcon />
								</Avatar>
							}
							action={
								<IconButton aria-label="settings">
									<MoreVertIcon />
								</IconButton>
							}
							title="Featured Listings"
						/>
						<CardMedia component="img" height="194" image={studio} />
						<CardContent>
							<Typography variant="body2" color="text.secondary">
								Discover our selection of elegant and affordable studio
								apartments in prime locations, designed for your comfort and
								convenience. Find your perfect home today!
							</Typography>
						</CardContent>
						<CardActions disableSpacing>
							<IconButton aria-label="add to favorites">
								<FavoriteIcon />
							</IconButton>
							<IconButton aria-label="share">
								<ShareIcon />
							</IconButton>
							<ExpandMore
								expand={expanded}
								onClick={handleExpandClick}
								aria-expanded={expanded}
								aria-label="show more"
							>
								<ExpandMoreIcon />
							</ExpandMore>
						</CardActions>
						<Collapse in={expanded} timeout="auto" unmountOnExit>
							<CardContent>
								<Typography paragraph>Method:</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography>
									Set aside off of the heat to let rest for 10 minutes, and then
									serve.
								</Typography>
							</CardContent>
						</Collapse>
					</Card>
					<Card sx={{ flex: '1', bgcolor: 'skyblue', maxWidth: 345, m: 2 }}>
						<CardHeader
							avatar={
								<Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
									<HouseIcon />
								</Avatar>
							}
							action={
								<IconButton aria-label="settings">
									<MoreVertIcon />
								</IconButton>
							}
							title="Featured Listings"
						/>
						<CardMedia component="img" height="194" image={houses} />
						<CardContent>
							<Typography variant="body2" color="text.secondary">
								Discover our selection of elegant and affordable studio
								apartments in prime locations, designed for your comfort and
								convenience. Find your perfect home today!
							</Typography>
						</CardContent>
						<CardActions disableSpacing>
							<IconButton aria-label="add to favorites">
								<FavoriteIcon />
							</IconButton>
							<IconButton aria-label="share">
								<ShareIcon />
							</IconButton>
							<ExpandMore
								expand={expanded}
								onClick={handleExpandClick}
								aria-expanded={expanded}
								aria-label="show more"
							>
								<ExpandMoreIcon />
							</ExpandMore>
						</CardActions>
						<Collapse in={expanded} timeout="auto" unmountOnExit>
							<CardContent>
								<Typography paragraph>Method:</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography paragraph>xyz</Typography>
								<Typography>
									Set aside off of the heat to let rest for 10 minutes, and then
									serve.
								</Typography>
							</CardContent>
						</Collapse>
					</Card>
				</Box>
				<Box>
					<LinkedInIcon />
					<TwitterIcon />
					<FacebookIcon />
					<InstagramIcon />
				</Box>
			</Box>
			<Title
				variant="h2"
				sx={{
					fontSize: '40px',
					color: '#687690',
					fontWeight: '500',
					mt: 10,
					mb: 4,
					textAlign: 'center',
				}}
			>
				Check out these websites too!
			</Title>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Box sx={{ flex: '1', mx: 4 }}>
					<a href="https://www.zillow.com/">
						<img
							src={zillow}
							alt="zillow "
							style={{
								maxWidth: '100%',
								width: '100%',
								height: 'auto',
								boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
								borderRadius: '10px',
							}}
						/>
					</a>
				</Box>
				<Box sx={{ flex: '1', mx: 4 }}>
					<a href="https://www.trulia.com/">
						<img
							src={trulia}
							alt="trulia "
							style={{
								maxWidth: '100%',
								width: '100%',
								height: 'auto',
								boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
								borderRadius: '10px',
							}}
						/>
					</a>
				</Box>
				<Box sx={{ flex: '1', mx: 4 }}>
					<a href="http://tulire.com/">
						<img
							src={tuli}
							alt="tuli "
							style={{
								maxWidth: '100%',
								width: '100%',
								height: 'auto',
								boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
								borderRadius: '10px',
							}}
						/>
					</a>
				</Box>
			</Box>
			<Typography
				variant="h4"
				sx={{
					textAlign: 'center',

					// lineHeight: '0.1em',
					// margin: '10px 0 20px',
					my: 2,
				}}
			>
				⭐⭐⭐⭐⭐
			</Typography>
			<Typography
				variant="h4"
				sx={{
					my: 2,
					textAlign: 'center',
				}}
			>
				____
			</Typography>
			<Typography
				variant="h4"
				sx={{
					my: 2,
					textAlign: 'center',
					fontWeight: 'bold',
					color: '#4c4c4c',
					'&:hover': {
						color: '#187bcd',
						transition: '0.3s ease',
					},
					'@media only screen and (max-width: 600px)': {
						fontSize: '24px',
					},
				}}
			>
				How Does Our Website Work?
			</Typography>
		</Box>
	);
}

export default Homepage;
