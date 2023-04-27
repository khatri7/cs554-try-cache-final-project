import React from 'react';
import logo from './favicon.png';

function Loader() {
	return (
		<div className="loader-container">
			<img src={logo} alt="Try&Cache" />
		</div>
	);
}

export default Loader;
