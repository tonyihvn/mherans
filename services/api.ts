

const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return (import.meta.env.VITE_API_URL);

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return (import.meta.env.VITE_API_URL);
  }
  return `/api`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('[API Service] Initialized with base URL:', API_BASE_URL);

export const facilitiesService = {
  getAll: async () => {
    try {
      console.log('[API] Fetching facilities from:', `${API_BASE_URL}/facilities`);
      const response = await fetch(`${API_BASE_URL}/facilities`, {
        credentials: 'include'
      });
      console.log('[API] Facilities response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Facilities error response:', errorText);
        throw new Error(`Failed to fetch facilities: ${response.status}`);
      }
      const data = await response.json();
      console.log('[API] Facilities loaded:', data.length, 'items');
      return data;
    } catch (err) {
      console.error('[API] Facilities error:', err);
      throw err;
    }
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch facility');
    return response.json();
  },

  create: async (facility) => {
    const response = await fetch(`${API_BASE_URL}/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facility)
    });
    if (!response.ok) throw new Error('Failed to create facility');
    return response.json();
  },

  update: async (id, facility) => {
    const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facility)
    });
    if (!response.ok) throw new Error('Failed to update facility');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete facility');
    return response.json();
  }
};

export const usersService = {
  getAll: async () => {
    try {
      console.log('[API] Fetching users from:', `${API_BASE_URL}/users`);
      const response = await fetch(`${API_BASE_URL}/users`, {
        credentials: 'include'
      });
      console.log('[API] Users response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Users error response:', errorText);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      console.log('[API] Users loaded:', data.length, 'items');
      return data;
    } catch (err) {
      console.error('[API] Users error:', err);
      throw err;
    }
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  create: async (user) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: user.name,
        email: user.email || null,
        password: user.password || null,
        user_type: user.user_type || user.role,
        assigned_facility_id: user.assigned_facility_id || user.facilityId || null,
        assigned_state: user.assigned_state || user.stateName || null
      })
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  update: async (id, user) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: user.name,
        email: user.email || null,
        password: user.password || null,
        user_type: user.user_type || user.role,
        assigned_facility_id: user.assigned_facility_id || user.facilityId || null,
        assigned_state: user.assigned_state || user.stateName || null
      })
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  }
};

export const auditsService = {
  getAll: async () => {
    try {
      console.log('[API] Fetching audits from:', `${API_BASE_URL}/audits`);
      const response = await fetch(`${API_BASE_URL}/audits`, {
        credentials: 'include'
      });
      console.log('[API] Audits response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Audits error response:', errorText);
        throw new Error(`Failed to fetch audits: ${response.status}`);
      }
      const data = await response.json();
      console.log('[API] Audits loaded:', data.length, 'items');
      return data;
    } catch (err) {
      console.error('[API] Audits error:', err);
      throw err;
    }
  },

  getByFacilityId: async (facilityId) => {
    const response = await fetch(`${API_BASE_URL}/audits/facility/${facilityId}`);
    if (!response.ok) throw new Error('Failed to fetch audit');
    return response.json();
  },

  save: async (facilityId, auditData) => {
    const response = await fetch(`${API_BASE_URL}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityId, ...auditData })
    });
    if (!response.ok) throw new Error('Failed to save audit');
    return response.json();
  },

  update: async (auditId, auditData) => {
    const response = await fetch(`${API_BASE_URL}/audits/${auditId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditData)
    });
    if (!response.ok) throw new Error('Failed to update audit');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/audits/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete audit');
    return response.json();
  }
};

export const configService = {
  get: async () => {
    try {
      console.log('[API] Fetching config from:', `${API_BASE_URL}/config`);
      const response = await fetch(`${API_BASE_URL}/config`);
      console.log('[API] Config response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Config error response:', errorText);
        throw new Error(`Failed to fetch config: ${response.status}`);
      }
      const data = await response.json();
      console.log('[API] Config loaded:', data);
      return data;
    } catch (err) {
      console.error('[API] Config error:', err);
      throw err;
    }
  },

  update: async (config) => {
    const response = await fetch(`${API_BASE_URL}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to update config');
    return response.json();
  }
};
export const datasetsService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/datasets`);
    if (!response.ok) throw new Error('Failed to fetch datasets');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}`);
    if (!response.ok) throw new Error('Failed to fetch dataset');
    return response.json();
  },

  getByFacility: async (facilityId) => {
    const response = await fetch(`${API_BASE_URL}/datasets/facility/${facilityId}`);
    if (!response.ok) throw new Error('Failed to fetch facility datasets');
    return response.json();
  },

  create: async (name, apiUrl, description, data, createdBy) => {
    const response = await fetch(`${API_BASE_URL}/datasets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, apiUrl, description, data, createdBy })
    });
    if (!response.ok) throw new Error('Failed to create dataset');
    return response.json();
  },

  update: async (id, name, apiUrl, description, data) => {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, apiUrl, description, data })
    });
    if (!response.ok) throw new Error('Failed to update dataset');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete dataset');
    return response.json();
  },

  link: async (datasetId, facilityId, recordIndex = 0, createdBy = null) => {
    const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}/link/${facilityId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordIndex, createdBy })
    });
    if (!response.ok) throw new Error('Failed to link dataset');
    return response.json();
  },

  unlink: async (datasetId, facilityId) => {
    const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}/link/${facilityId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to unlink dataset');
    return response.json();
  },

  search: async (query) => {
    const response = await fetch(`${API_BASE_URL}/datasets/search/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search datasets');
    return response.json();
  }
};

export const indicatorsService = {
  getAll: async () => {
    try {
      console.log('[API] Fetching indicators from:', `${API_BASE_URL}/indicators`);
      const response = await fetch(`${API_BASE_URL}/indicators`);
      console.log('[API] Indicators response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Indicators error response:', errorText);
        throw new Error(`Failed to fetch indicators: ${response.status}`);
      }
      const data = await response.json();
      console.log('[API] Indicators loaded:', data.length, 'items');
      return data;
    } catch (err) {
      console.error('[API] Indicators error:', err);
      throw err;
    }
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/indicators/${id}`);
    if (!response.ok) throw new Error('Failed to fetch indicator');
    return response.json();
  },

  getByCategory: async (category) => {
    const response = await fetch(`${API_BASE_URL}/indicators/category/${category}`);
    if (!response.ok) throw new Error('Failed to fetch indicators by category');
    return response.json();
  },

  create: async (indicator) => {
    const response = await fetch(`${API_BASE_URL}/indicators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(indicator)
    });
    if (!response.ok) throw new Error('Failed to create indicator');
    return response.json();
  },

  update: async (id, indicator) => {
    const response = await fetch(`${API_BASE_URL}/indicators/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(indicator)
    });
    if (!response.ok) throw new Error('Failed to update indicator');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/indicators/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete indicator');
    return response.json();
  }
};