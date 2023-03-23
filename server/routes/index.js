const configRoutes = (app) => {
	app.get('/', (req, res) => {
		res.json({
			message: 'Hello Word!',
		});
	});
};

export default configRoutes;
