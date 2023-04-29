import { Button } from '@mui/material';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function SingleListing() {
	const navigate = useNavigate();
	const { id } = useParams();
	return (
		<div>
			<Button
				variant="contained"
				onClick={() => {
					navigate(`/listings/${id}/application`);
				}}
			>
				Apply
			</Button>
		</div>
	);
}

export default SingleListing;
