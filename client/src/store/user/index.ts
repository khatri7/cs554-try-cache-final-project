import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type UserSliceState = {
	value: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		role: 'tenant' | 'lessor';
	} | null;
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
