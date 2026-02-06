import api from './api';

const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Registration now returns success message, not token immediately (requires activation)
    return response.data;
};

const login = async (userData) => {
    const response = await api.post('/auth/login', userData);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const activate = async (token) => {
    const response = await api.put(`/auth/activate/${token}`);
    return response.data;
};

const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
};

const resetPassword = async (token, password) => {
    const response = await api.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    activate,
    forgotPassword,
    resetPassword
};

export default authService;
