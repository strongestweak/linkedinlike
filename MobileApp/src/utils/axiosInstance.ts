import axios, {AxiosHeaders} from 'axios';
import Config from 'react-native-config';
import useAuthStore from '../stores/auth';
import {Pagination} from './types';

const axiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const authState = useAuthStore.getState() || {};
      try {
        const access_token = await authState.refreshToken();
        axiosInstance.defaults.headers.common.Authorization =
          'Bearer ' + access_token;
        delete originalRequest.headers.Authorization;
        return axiosInstance(originalRequest);
      } catch (err) {
        authState.logout(false);
      }
    }
    return Promise.reject(error);
  },
);

export const getHeaderPagination = (headers: AxiosHeaders): Pagination => {
  const pagination: Pagination = {
    offset: 0,
    total: 0,
    count: 0,
  };
  let paginationString = headers['content-range'];
  if (!paginationString) {
    return pagination;
  } else {
    paginationString = paginationString.replace('items', '').trim();
    const [rangeString, total] = paginationString.split('/');
    const [offset, count] = rangeString.split('-');

    pagination.count = Number.parseInt(count, 10);
    if (pagination.count !== 0) {
      pagination.count += 1;
    }
    pagination.total = Number.parseInt(total, 10);
    pagination.offset = Number.parseInt(offset, 10);
  }
  return pagination;
};

export default axiosInstance;
