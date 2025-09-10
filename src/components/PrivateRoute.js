import { Navigate } from 'react-router-dom';

// Helper function to check if JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token expires within next 5 minutes (300 seconds)
    return payload.exp < (currentTime + 300);
  } catch (error) {
    console.warn('Invalid token format:', error);
    return true;
  }
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access');
  const refreshToken = localStorage.getItem('refresh');

  // Check if access token exists and is valid
  if (!token || isTokenExpired(token)) {
    // If we have a refresh token, let the axios interceptor handle refresh
    if (refreshToken && !isTokenExpired(refreshToken)) {
      // Token will be refreshed by axios interceptor on next API call
      return children;
    }
    
    // No valid tokens, redirect to login
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
