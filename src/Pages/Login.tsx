import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient, endpoints } from '../utils/api';

interface LoginProps {
  onLogin: (phone: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string; api?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};
    
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors(prev => ({ ...prev, api: undefined })); // Clear previous API errors
    
    try {
      // Log the request for debugging
      console.log('Login request:', {
        url: endpoints.login,
        payload: { phone, password }
      });

      // REAL API CALL - Using actual backend
      const response = await apiClient.post(endpoints.login, {
        phone: phone,
        password: password
      });

     

      console.log('Login response:', response.data);

      // Handle successful login
      if (response.data && response.status === 200) {
        // Store token if provided - handle both formats
        let accessToken = null;
        if (response.data.tokens && response.data.tokens.length > 0) {
          // New format: tokens array
          accessToken = response.data.tokens[0].access_token;
          localStorage.setItem('authToken', accessToken);
          if (response.data.tokens[0].refresh_token) {
            localStorage.setItem('refreshToken', response.data.tokens[0].refresh_token);
          }
        }
        // Note: Mock response uses tokens array format, no legacy format needed
        
        // Store user data if provided
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        
        // Store worker data if provided
        if (response.data.worker) {
          localStorage.setItem('workerData', JSON.stringify(response.data.worker));
        }

        onLogin(phone, password);
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // REAL API ERROR HANDLING
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data?.error || 'Login failed';
          
          if (status === 401) {
            setErrors(prev => ({ ...prev, api: 'Invalid phone number or password' }));
          } else if (status === 404) {
            setErrors(prev => ({ ...prev, api: 'User not found' }));
          } else if (status >= 500) {
            setErrors(prev => ({ ...prev, api: 'Server error. Please try again later.' }));
          } else {
            setErrors(prev => ({ ...prev, api: message }));
          }
        } else if (error.request) {
          // Network error
          setErrors(prev => ({ ...prev, api: 'Network error. Please check your connection.' }));
        } else {
          setErrors(prev => ({ ...prev, api: 'An unexpected error occurred.' }));
        }
      } else {
        setErrors(prev => ({ ...prev, api: 'An unexpected error occurred.' }));
      }

      // COMMENTED OUT: Mock error handling - uncomment for testing without backend  
      /*
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, api: error.message }));
      } else {
        setErrors(prev => ({ ...prev, api: 'Invalid credentials. Please use the mock credentials provided.' }));
      }
      */
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Please sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
           <form className="space-y-6" onSubmit={handleSubmit}>
             {/* API Error Message */}
             {errors.api && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                 <div className="flex items-center">
                   <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <p className="text-sm text-red-700">{errors.api}</p>
                 </div>
               </div>
             )}
             {/* Phone Field */}
             <div>
               <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                 Phone Number
               </label>
               <div className="relative">
                 <input
                   id="phone"
                   name="phone"
                   type="tel"
                   autoComplete="tel"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   className={`appearance-none relative block w-full px-4 py-3 border ${
                     errors.phone ? 'border-red-300' : 'border-gray-300'
                   } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                   placeholder="Enter your phone number"
                 />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                   <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.4 11.392a11.097 11.097 0 006.208 6.208l2.005-3.824a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                   </svg>
                 </div>
               </div>
               {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
             </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
                  </button>
            </div>
          </form>

           {/* API Info */}
           {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
             <h3 className="text-sm font-medium text-blue-800 mb-2">🔗 API Connection Active</h3>
             <p className="text-xs text-blue-700">Using real backend API for authentication</p>
             <p className="text-xs text-blue-600 mt-1">Enter your valid phone number and password to login</p>
           </div> */}
        </div>

        {/* Footer */}
        
      </div>
    </div>
  );
};

export default Login;