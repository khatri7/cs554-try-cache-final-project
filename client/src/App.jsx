import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Layout from 'components/Layout';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from 'routes';

function App() {
	return (
		<Router>
			<Layout>
				<Routes />
			</Layout>
		</Router>
	);
}

export default App;
