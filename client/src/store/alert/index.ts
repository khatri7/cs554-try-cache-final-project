import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type AlertSliceState = {
	open: boolean;
	type: 'info' | 'error' | 'warning' | 'success';
	message: string;
};

const initialState: AlertSliceState = {
	open: false,
	type: 'info',
	message: '',
};

export const alertSlice = createSlice({
	name: 'alert',
	initialState,
	reducers: {
		errorAlert: (state, action: PayloadAction<string>) => {
			state.open = true;
			state.type = 'error';
			state.message = action.payload;
		},
		warningAlert: (state, action: PayloadAction<string>) => {
			state.open = true;
			state.type = 'warning';
			state.message = action.payload;
		},
		infoAlert: (state, action: PayloadAction<string>) => {
			state.open = true;
			state.type = 'info';
			state.message = action.payload;
		},
		successAlert: (state, action: PayloadAction<string>) => {
			state.open = true;
			state.type = 'success';
			state.message = action.payload;
		},
		dismissAlert: (state) => {
			state.open = false;
			state.type = 'info';
			state.message = '';
		},
	},
});

export const {
	infoAlert,
	warningAlert,
	successAlert,
	errorAlert,
	dismissAlert,
} = alertSlice.actions;

export default alertSlice.reducer;
