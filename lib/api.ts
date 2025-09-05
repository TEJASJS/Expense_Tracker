import { Wallet, WalletApiResponse } from '@/types/wallet';
import { Budget } from '@/types/budget';
import { Expense } from '@/types/expense';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMessage = 'An error occurred';

    if (data.detail) {
      if (Array.isArray(data.detail) && data.detail.length > 0 && data.detail[0].msg) {
        errorMessage = data.detail.map((err: any) => `${err.loc.slice(1).join(' ')}: ${err.msg}`).join(', ');
      } else if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      }
    } else {
      errorMessage = response.statusText;
    }

    return {
      error: errorMessage,
      status: response.status,
    };
  }

  return { data, status: response.status };
}

export async function apiGet<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`Making GET request to: ${API_BASE_URL}${endpoint}`);
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    console.log(`Response status: ${response.status}`);
    const responseClone = response.clone(); // Clone the response for logging
    const responseData = await responseClone.json().catch(() => ({}));
    console.log('Response data:', responseData);

    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
      status: 0,
    };
  }
}

export async function apiPost<T>(
  endpoint: string,
  data: any,
  token?: string
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {};
    let body: BodyInit;

    if (data instanceof URLSearchParams) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
    });

    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
      status: 0,
    };
  }
}

export async function apiPut<T>(
  endpoint: string,
  data: any,
  token?: string
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
    });

    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
      status: 0,
    };
  }
}

export async function apiDelete<T>(
  endpoint: string,
  token?: string
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
      status: 0,
    };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    
    return apiPost<{ access_token: string }>('/api/auth/token', formData);
  },
  
  register: (email: string, password: string, fullName?: string) =>
    apiPost('/api/auth/register', { email, password, full_name: fullName }),
  
  getMe: (token: string) =>
    apiGet<{
      id: string;
      email: string;
      full_name: string;
    }>('/api/auth/me', token),

  deleteAccount: (token: string) => 
    apiDelete('/api/auth/delete', token),
};

// Wallets API
export const walletsApi = {
  getWallets: (token: string) =>
    apiGet<WalletApiResponse[]>('/api/wallets', token),
  
  createWallet: (data: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'sharedWith'>, token: string) =>
    apiPost<WalletApiResponse>('/api/wallets', data, token),
  
  addBalanceToWallet: (id: string, amount: number, token: string) =>
    apiPost(`/api/wallets/${id}/add_balance`, { amount }, token),
  
  deleteWallet: (id: string, token: string) =>
    apiDelete(`/api/wallets/${id}`, token),
};

// Expenses API
export const expensesApi = {
  getExpenses: async (token: string, filters: any = {}) => {
    const query = new URLSearchParams(filters).toString();
    console.log(`Fetching expenses from: /api/expenses?${query}`);
    try {
      const response = await apiGet<Expense[]>(`/api/expenses?${query}`, token);
      console.log('Raw API response:', response);
      return response;
    } catch (error) {
      console.error('Error in getExpenses:', error);
      throw error;
    }
  },
  createExpense: (data: Partial<Expense>, token: string) => {
    const { walletId, ...rest } = data;
    const payload = {
      ...rest,
      wallet_id: walletId,
    };
    return apiPost<Expense>('/api/expenses', payload, token);
  },
  updateExpense: (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>, token: string) => {
    const { walletId, ...rest } = data;
    const payload: Partial<Expense> & { wallet_id?: string } = { ...rest };
    if (walletId) {
      payload.wallet_id = walletId;
    }
    return apiPut<Expense>(`/api/expenses/${id}`, payload, token);
  },
  deleteExpense: (id: string, token: string) =>
    apiDelete(`/api/expenses/${id}`, token),
};

// Goals API
export const goalsApi = {
  async getGoals(token: string) {
    return apiGet<any[]>('/api/goals', token);
  },

  async createGoal(data: any, token: string) {
    return apiPost<any>('/api/goals', data, token);
  },

  async updateGoal(id: string, data: any, token: string) {
    return apiPut<any>(`/api/goals/${id}`, data, token);
  },

  async deleteGoal(id: string, token: string) {
    return apiDelete<{ success: boolean }>(`/api/goals/${id}`, token);
  },

  addFundsToGoal: (goalId: string, amount: number, walletId: string, token: string) => {
    return apiPost(`/api/goals/${goalId}/add_funds`, { amount, wallet_id: walletId }, token);
  },
};

// Budgets API
export const budgetsApi = {
  getBudgets: (token: string) =>
    apiGet<Budget[]>('/api/budgets', token),

  createBudget: (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'name'>, token: string) => {
    const payload = {
      amount: data.amount,
      category: data.category,
      start_date: data.startDate,
      end_date: data.endDate,
    };
    return apiPost<Budget>('/api/budgets', payload, token);
  },

  updateBudget: (id: string, data: Partial<Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'name'>>, token: string) => {
    const { startDate, endDate, ...rest } = data;
    const payload: any = { ...rest };
    if (startDate) {
      payload.start_date = startDate;
    }
    if (endDate) {
      payload.end_date = endDate;
    }
    return apiPut<Budget>(`/api/budgets/${id}`, payload, token);
  },

  deleteBudget: (id: string, token: string) =>
    apiDelete(`/api/budgets/${id}`, token),
};
