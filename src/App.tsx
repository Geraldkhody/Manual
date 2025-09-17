import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import WorkerList from './Pages/WorkerList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        // Check if token is valid (not expired)
        try {
          const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (tokenPayload.exp && tokenPayload.exp > currentTime) {
            // Token is valid
            setIsAuthenticated(true);
          } else {
            // Token expired, clear it
            clearAuthData();
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Invalid token format, clear it
          clearAuthData();
          setIsAuthenticated(false);
        }
      } else {
        // No token found
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('workerData');
  };

  const handleLogin = (phone: string, password: string) => {
    // Authentication is handled by the Login component with the real API
    // This function is called after successful API authentication
    if (phone && password) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    // Clear stored authentication data
    clearAuthData();
    setIsAuthenticated(false);
  };



  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <WorkerList onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
