import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET, handleError } from 'utils/api-calls';

function useQuery<T = any>(endpoint: string) {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | false>(false);
	const [data, setData] = useState<T | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const makeReq = async () => {
			try {
				const res: AxiosResponse<T>['data'] = await GET<T>(endpoint);
				setData(res);
				setLoading(false);
				setError(false);
			} catch (e: any) {
				setData(null);
				setLoading(false);
				if (typeof handleError(e) === 'string') setError(handleError(e));
				else setError('Unknown error occurred');
				if (e.response?.status === 404)
					navigate('/404', {
						state: { message: handleError(e) },
					});
			}
		};
		makeReq();
	}, [endpoint, navigate]);

	return {
		loading,
		error,
		data,
	};
}

export default useQuery;
