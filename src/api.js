const API_URL = 'http://localhost:3001/api';

export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || 'Lỗi kết nối API');
  }

  return data;
}

export default {
  // Auth
  login: (phone, password, role) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password, role }) }),
  getProfile: () => fetchApi('/auth/profile'),
  
  // Categories
  getCategories: () => fetchApi('/categories'),
  createCategory: (data) => fetchApi('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => fetchApi(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => fetchApi(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => fetchApi('/products'),
  createProduct: (data) => fetchApi('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => fetchApi(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => fetchApi(`/products/${id}`, { method: 'DELETE' }),

  // Tables
  getTables: () => fetchApi('/tables'),
  createTable: (data) => fetchApi('/tables', { method: 'POST', body: JSON.stringify(data) }),
  deleteTable: (id) => fetchApi(`/tables/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => fetchApi('/orders'),
  createOrder: (data) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => fetchApi(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateOrderItemStatus: (orderId, itemIndex, status) => fetchApi(`/orders/${orderId}/items/${itemIndex}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Company Settings
  getCompanyInfo: () => fetchApi('/company'),
  updateCompanyInfo: (data) => fetchApi('/company', { method: 'PUT', body: JSON.stringify(data) }),

  // Users
  getUsers: () => fetchApi('/users'),
  createUser: (data) => fetchApi('/users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
  updateUserPassword: (id, password) => fetchApi(`/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ password }) }),

  // Notifications
  getNotifications: () => fetchApi('/notifications'),
  createNotification: (data) => fetchApi('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  resolveNotification: (id) => fetchApi(`/notifications/${id}/resolve`, { method: 'PUT' }),
};
