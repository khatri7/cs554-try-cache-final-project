import CreateListing from 'pages/CreateListing';
import Home from 'pages/Home';
import Listings from 'pages/Listings';
import Login from 'pages/Login';
import Signup from 'pages/Signup';
import React from 'react';
import { Routes as RRDRoutes, Route } from 'react-router-dom';

function Routes() {
	return (
		<RRDRoutes>
			<Route index element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/listings">
				<Route index element={<Listings />} />
				<Route path="create" element={<CreateListing />} />
			</Route>
		</RRDRoutes>
	);
}

export default Routes;
