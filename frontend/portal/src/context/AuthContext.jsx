import { createContext, useContext, useState, useEffect } from 'react';
import { API_PATHS } from '../Utils/apiPaths';
import axiosInstance from '../Utils/axiosinstance';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        // Assuming there is an endpoint to get the current user profile
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, userData);
      const { token, _id, role, name, email } = response.data;

      // If the backend returns the user object structure similar to login
      // Construct user object if needed or use response.data if it's the user
      // Based on controller it returns: { _id, name, email, avatar, role, token, ... }
      const userObj = { _id, role, name, email, avatar: response.data.avatar };

      localStorage.setItem('accessToken', token);
      setUser(userObj);
      toast.success('Account created successfully!');
      return { success: true, user: userObj };
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      const { token, ...user } = response.data;

      localStorage.setItem('accessToken', token);
      setUser(user);
      toast.success('Logged in successfully!');
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
