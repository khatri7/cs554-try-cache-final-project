import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Layout from 'components/Layout';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from 'routes';
import { createTheme, Theme, ThemeProvider } from '@mui/material';

const theme: Theme = createTheme({
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					'&.Mui-disabled': {
						':disabled': {
							color: '#5c5c5c',
						},
					},
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& legend': { display: 'none' },
					'& fieldset': { top: 0 },
					'& label': {
						padding: '0 5px',
						background: 'white',
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					'&.Mui-disabled': {
						color: '#747474',
					},
				},
			},
		},
		MuiAvatar: {
			styleOverrides: {
				root: {
					backgroundColor: '#767676',
				},
			},
		},
	},
});

function App() {
	return (
		<ThemeProvider theme={theme}>
			<Router>
				<Layout>
					<Routes />
				</Layout>
			</Router>
		</ThemeProvider>
	);
}

export default App;
