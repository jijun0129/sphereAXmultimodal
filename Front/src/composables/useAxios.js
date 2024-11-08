import axios from 'axios';

export default () => {
	const setBaseURL = url => {
		axios.defaults.baseURL = url;
	};

	return {
		axios,
		setBaseURL,
	};
};
