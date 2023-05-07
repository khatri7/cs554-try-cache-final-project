import React from 'react';
import logo from './favicon.png';

const Loader: React.FC<{}> = () => {
	return (
		<div className="loader-container">
			<img src={logo} alt="Try&Cache" />
		</div>
	);
};

export default Loader;
