import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import alert from './alert';
import user from './user';
import app from './app';

const store = configureStore({ reducer: { alert, user, app } });

export default store;

// state and dispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// custom useDispatch hook with AppDispatch type
export const useAppDispatch: () => AppDispatch = useDispatch;
