import { useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { toast, showToast, hideToast, handleApiError } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      showToast('Kullanıcı adı ve şifre gerekli', 'warning');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await api.post('token/', { 
        username: username.trim(), 
        password 
      });
      
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      
      showToast('Giriş başarılı, yönlendiriliyorsunuz...');
      
      // Small delay for better UX
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('Kullanıcı adı veya şifre hatalı', 'error');
      } else {
        handleApiError(err, 'Giriş yapılamadı');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
        {/* Floating Shapes */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md space-y-8"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          >
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
          >
            MyERP'ye Hoşgeldiniz
          </motion.h2>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 font-medium"
          >
            İşletmenizi dijitalleştirin
          </motion.p>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kullanıcı Adı</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 placeholder-gray-400"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 placeholder-gray-400"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
            whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full relative overflow-hidden py-4 px-6 rounded-2xl text-white font-semibold text-lg shadow-xl transition-all duration-300 ${
              loading ? 'cursor-not-allowed' : 'hover:shadow-2xl'
            }`}
            style={{
              background: loading 
                ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              backgroundSize: '200% 200%',
              animation: loading ? 'none' : 'gradient 3s ease infinite'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Giriş yapılıyor...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Giriş Yap</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </motion.button>
        </form>
      </motion.div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default Login;
