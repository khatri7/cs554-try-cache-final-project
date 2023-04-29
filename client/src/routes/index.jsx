import Application from 'pages/Application';
import CreateListing from 'pages/CreateListing';
import Home from 'pages/Home';
import Listings from 'pages/Listings';
import Login from 'pages/Login';
import Signup from 'pages/Signup';
import SingleListing from 'pages/SingleListing';
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
				<Route path=":id">
					<Route index element={<SingleListing />} />
					<Route path="application" element={<Application />} />
				</Route>
			</Route>
		</RRDRoutes>
	);
}

export default Routes;
