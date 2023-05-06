import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { User } from 'utils/types';

type UserSliceState = {
	value: User | null;
};

const initialState: UserSliceState = {
	value: null,
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<UserSliceState['value']>) => {
			return {
				value: action.payload,
			};
		},
		unsetUser: () => {
			return {
				value: null,
			};
		},
	},
});

export const { setUser, unsetUser } = userSlice.actions;

export default userSlice.reducer;
