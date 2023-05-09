import Application from 'pages/Application';
import CreateListing from 'pages/CreateListing';
import Home from 'pages/Home';
import Listings from 'pages/Listings';
import Login from 'pages/Login';
import MyApplications from 'pages/MyApplications';
import Signup from 'pages/Signup';
import SingleApplication from 'pages/SingleApplication';
import SingleListing from 'pages/SingleListing';
import Dashboard from 'pages/Dashboard';
import React from 'react';
import {
	Navigate,
	Routes as RRDRoutes,
	Route,
	useLocation,
} from 'react-router-dom';
import { useAppSelector } from 'hooks';
import MyProfile from 'pages/MyProfile';
import ErrorPage from 'pages/404';
import ProtectedRoutes from './ProtectedRoutes';

function Routes() {
	const { pathname } = useLocation();
	const user = useAppSelector((state) => state.user.value);
	const isLoggedIn = user !== null;
	if (isLoggedIn && ['/login', '/signup'].includes(pathname))
		return <Navigate to="/" />;
	return (
		<RRDRoutes>
			<Route index element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/listings">
				<Route index element={<Listings />} />
				<Route path=":id" element={<SingleListing />} />
			</Route>

			{/* Protected Routes */}

			<Route element={<ProtectedRoutes requiredRole="lessor" />}>
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/listings/create" element={<CreateListing />} />
			</Route>
			<Route element={<ProtectedRoutes requiredRole="tenant" />}>
				<Route path="/listings/:id/application" element={<Application />} />
				<Route path="/my-applications" element={<MyApplications />} />
			</Route>
			<Route element={<ProtectedRoutes />}>
				<Route path="/applications/:id" element={<SingleApplication />} />
				<Route path="/my-profile" element={<MyProfile />} />
			</Route>
			<Route path="*" element={<ErrorPage />} />
		</RRDRoutes>
	);
}

export default Routes;
