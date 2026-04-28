import { getToken } from './authHelpers';

const API_BASE_URL = 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function fetchApi(endpoint: string, options: RequestOptions = {}) {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ocurrió un error inesperado');
    }

    return { response, data };
  } catch (error: any) {
    throw error;
  }
}
