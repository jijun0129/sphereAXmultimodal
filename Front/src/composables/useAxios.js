import axiosInstance from '@/plugins/axios';

export function useAxios() {
	return { axios: axiosInstance };
}
