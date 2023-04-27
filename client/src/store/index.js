import { configureStore } from '@reduxjs/toolkit';
import alert from './alert';
import user from './user';
import app from './app';

const store = configureStore({ reducer: { alert, user, app } });

export default store;
