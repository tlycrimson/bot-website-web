import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token
      localStorage.setItem('admin_token', token);
      
      // Use a small delay to ensure token is stored
      setTimeout(() => {
        // Navigate to admin panel
        navigate('/admin', { replace: true });
      }, 100);
    } else {
      // No token found, go to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-400">Completing authentication...</p>
        <p className="text-gray-500 text-sm mt-2">You will be redirected shortly</p>
      </div>
    </div>
  );
};

export default AuthRedirect;