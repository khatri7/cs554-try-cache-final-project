import Application from 'pages/Application';
import CreateListing from 'pages/CreateListing';
import Home from 'pages/Home';
import Listings from 'pages/Listings';
import Login from 'pages/Login';
import MyApplications from 'pages/MyApplications';
import Signup from 'pages/Signup';
import SingleListing from 'pages/SingleListing';
import Dashboard from 'pages/Dashboard';
import React from 'react';
import { Routes as RRDRoutes, Route } from 'react-router-dom';

function Routes() {
	return (
		<RRDRoutes>
			<Route index element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/listings">
				<Route index element={<Listings />} />
				<Route path="create" element={<CreateListing />} />
				<Route path=":id">
					<Route index element={<SingleListing />} />
					<Route path="application" element={<Application />} />
				</Route>
			</Route>
			<Route path="/my-applications" element={<MyApplications />} />
		</RRDRoutes>
	);
}

export default Routes;
