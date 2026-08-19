const API_BASE_URL_CANDIDATES = [
  import.meta.env.VITE_API_BASE_URL,
  'http://localhost:4002/api',
  'http://localhost:4001/api',
].filter(Boolean) as string[];

const API_BASE_URL = API_BASE_URL_CANDIDATES[0] || 'http://localhost:4002/api';

function getCandidateUrls(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (/^https?:\/\//i.test(path)) {
    return [path];
  }

  return API_BASE_URL_CANDIDATES.map((baseUrl) => `${baseUrl}${normalizedPath}`);
}

async function request(path: string, options?: RequestInit): Promise<Response> {
  const candidates = getCandidateUrls(path);
  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, options);
      if (response.ok || response.status >= 400) {
        return response;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw new Error(
    lastError
      ? lastError.message
      : `Unable to connect to the backend. Start the backend with "npm run dev" from the backend folder. Tried: ${candidates.join(', ')}`
  );
}

export type AdminCredentials = {
  username: string;
  password: string;
};

// ===== USER AUTHENTICATION API =====

export const authAPI = {
  register: async (name: string, email: string, password: string, referralCode?: string, role?: string, salesExecutive?: string) => {
    const response = await request(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, referralCode, role, salesExecutive }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await request(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },
};

// ===== ADMIN MANAGEMENT API =====

function adminHeaders(credentials: AdminCredentials) {
  return {
    'Content-Type': 'application/json',
    'x-admin-username': credentials.username,
    'x-admin-password': credentials.password,
  };
}

export const adminAPI = {
  getBookings: async (credentials: AdminCredentials) => {
    const response = await request('/admin/bookings', { headers: adminHeaders(credentials) });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },
  saveBooking: async (credentials: AdminCredentials, booking: Record<string, unknown>) => {
    const response = await request('/admin/bookings', { method: 'POST', headers: adminHeaders(credentials), body: JSON.stringify(booking) });
    if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Failed to save booking'); }
    return response.json();
  },
  deleteBooking: async (credentials: AdminCredentials, id: string) => {
    const response = await request(`/admin/bookings/${encodeURIComponent(id)}`, { method: 'DELETE', headers: adminHeaders(credentials) });
    if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Failed to delete booking'); }
    return response.json();
  },
  getRewards: async (credentials: AdminCredentials) => {
    const response = await request('/admin/rewards', { headers: adminHeaders(credentials) });
    if (!response.ok) throw new Error('Failed to fetch rewards');
    return response.json();
  },
  issueReward: async (credentials: AdminCredentials, reward: Record<string, unknown>) => {
    const response = await request('/admin/rewards', { method: 'POST', headers: adminHeaders(credentials), body: JSON.stringify(reward) });
    if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Failed to issue reward'); }
    return response.json();
  },
  removeRewardFromSession: async (credentials: AdminCredentials, id: number) => {
    const response = await request(`/admin/rewards/${id}`, { method: 'PATCH', headers: adminHeaders(credentials), body: JSON.stringify({ status: 'archived' }) });
    if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Failed to remove reward from session'); }
    return response.json();
  },
  getCustomers: async (credentials: AdminCredentials) => {
    const response = await request('/admin/customers', { headers: adminHeaders(credentials) });
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },
  createCustomer: async (credentials: AdminCredentials, customer: Record<string, unknown>) => {
    const response = await request('/admin/customers', { method: 'POST', headers: adminHeaders(credentials), body: JSON.stringify(customer) });
    if (!response.ok) { const error = await response.json(); throw new Error(error.error || 'Failed to save customer'); }
    return response.json();
  },
  login: async (username: string, password: string) => {
    const response = await request('/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Admin login failed');
    }
    return response.json();
  },

  getUsers: async (credentials: AdminCredentials) => {
    const response = await request('/admin/users', {
      headers: adminHeaders(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch members');
    }
    return response.json();
  },

  updateUserRole: async (credentials: AdminCredentials, userId: number, role: string) => {
    const response = await request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: adminHeaders(credentials),
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user role');
    }
    return response.json();
  },

  deleteUser: async (credentials: AdminCredentials, userId: number) => {
    const response = await request(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: adminHeaders(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
    return response.json();
  },
};

// ===== USER PROFILE API =====

export const profileAPI = {
  getProfile: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  updateProfile: async (userId: number, name: string, email: string, avatar?: string) => {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, avatar }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    return response.json();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  updateUserRole: async (userId: number, role: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user role');
    }
    return response.json();
  },

  deleteUser: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
    return response.json();
  },
};

// ===== COMMUNITY API =====

export const communityAPI = {
  getCommunityStats: async () => {
    const response = await fetch(`${API_BASE_URL}/community`);
    if (!response.ok) {
      throw new Error('Failed to fetch community stats');
    }
    return response.json();
  },

  getStories: async () => {
    const response = await fetch(`${API_BASE_URL}/community/stories`);
    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }
    return response.json();
  },

  postStory: async (title: string, content: string, author: string) => {
    const response = await fetch(`${API_BASE_URL}/community/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, author }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to post story');
    }
    return response.json();
  },

  getTips: async () => {
    const response = await fetch(`${API_BASE_URL}/community/tips`);
    if (!response.ok) {
      throw new Error('Failed to fetch tips');
    }
    return response.json();
  },

  postTip: async (title: string, content: string, author: string) => {
    const response = await fetch(`${API_BASE_URL}/community/tips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, author }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to post tip');
    }
    return response.json();
  },
};

// ===== FEATURES API =====

export const featuresAPI = {
  getFeatures: async () => {
    const response = await fetch(`${API_BASE_URL}/features`);
    if (!response.ok) {
      throw new Error('Failed to fetch features');
    }
    return response.json();
  },
};

// ===== SUPPORT API =====

export const supportAPI = {
  getSupportInfo: async () => {
    const response = await fetch(`${API_BASE_URL}/support`);
    if (!response.ok) {
      throw new Error('Failed to fetch support info');
    }
    return response.json();
  },

  getTickets: async () => {
    const response = await fetch(`${API_BASE_URL}/support/tickets`);
    if (!response.ok) {
      throw new Error('Failed to fetch support tickets');
    }
    return response.json();
  },

  createTicket: async (subject: string, description: string, email: string) => {
    const response = await fetch(`${API_BASE_URL}/support/ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, description, email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create support ticket');
    }
    return response.json();
  },
};
