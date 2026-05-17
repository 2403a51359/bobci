import axios from 'axios';

// Server-side proxy keeps BOBCI_API_KEY off the client (see pages/api/bobci/[[...path]].js)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/bobci';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export async function getRepositories() {
  try {
    const response = await api.get('/api/repositories');
    return response.data;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
}

export async function addRepository(owner, repo, token, secret) {
  try {
    const response = await api.post('/api/repositories', {
      owner,
      repo,
      github_token: token,
      webhook_secret: secret,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding repository:', error);
    throw error;
  }
}

export async function getPullRequests(repoId = null, status = null, riskLevel = null) {
  try {
    const params = {};
    if (repoId) params.repo_id = repoId;
    if (status) params.status = status;
    if (riskLevel) params.risk_level = riskLevel;
    
    const response = await api.get('/api/pull-requests', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    throw error;
  }
}

export async function getPullRequest(prId) {
  try {
    const response = await api.get(`/api/pull-requests/${prId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pull request:', error);
    throw error;
  }
}

export async function getStats() {
  try {
    const response = await api.get('/api/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

export async function deleteRepository(repoId) {
  try {
    const response = await api.delete(`/api/repositories/${repoId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting repository:', error);
    throw error;
  }
}

export default api;

// Made with Bob
