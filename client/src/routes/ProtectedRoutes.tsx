import { useAppDispatch, useAppSelector } from 'hooks';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { errorAlert } from 'store/alert';
import { User } from 'utils/types';

const ProtectedRoutes: React.FC<{
	requiredRole?: User['role'] | undefined;
}> = ({ requiredRole }) => {
	const currUserRole = useAppSelector((state) => state.user.value?.role);
	const dispatch = useAppDispatch();

	if (!currUserRole) {
		dispatch(errorAlert('You must be logged in before accessing this route'));
		return <Navigate to="/login" replace />;
	}

	if (requiredRole && currUserRole !== requiredRole) {
		dispatch(
			errorAlert(
				`You must be logged in as a ${requiredRole} accessing this route`
			)
		);
		return <Navigate to="/" />;
	}

	return <Outlet />;
};

export default ProtectedRoutes;
