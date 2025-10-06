import { useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import { 
  sanitizeInput, 
  isValidUsername, 
  validatePasswordStrength,
  checkRateLimit,
  getRateLimitRemaining 
} from '../utils/security';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });

  const navigate = useNavigate();
  const { toast, showToast, hideToast, handleApiError } = useToast();

  // Update password strength on change
  const handlePasswordChange = (value) => {
    setPassword(value);
    const strength = validatePasswordStrength(value);
    setPasswordStrength(strength);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Input validation
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      showToast('Tüm alanları doldurun', 'warning');
      return;
    }
    
    // Sanitize username
    const sanitizedUsername = sanitizeInput(username.trim());
    
    // Validate username format
    if (!isValidUsername(sanitizedUsername)) {
      showToast('Kullanıcı adı 3-20 karakter olmalı ve sadece harf, rakam, tire, alt çizgi içerebilir', 'warning');
      return;
    }
    
    // Check password match
    if (password !== confirmPassword) {
      showToast('Şifreler eşleşmiyor', 'warning');
      return;
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (passwordValidation.strength < 2) {
      showToast(passwordValidation.message, 'warning');
      return;
    }
    
    // Check rate limiting
    if (!checkRateLimit('register', 3, 300000)) { // Max 3 attempts per 5 minutes
      const remaining = Math.ceil(getRateLimitRemaining('register') / 60);
      showToast(`Çok fazla kayıt denemesi! ${remaining} dakika sonra tekrar deneyin.`, 'error');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('register/', { 
        username: username.trim(), 
        password 
      });
      showToast('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      if (err.response?.data?.username) {
        showToast(err.response.data.username[0] || 'Bu kullanıcı adı zaten kullanılıyor', 'error');
      } else {
        handleApiError(err, 'Kayıt işlemi başarısız');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-8"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 180 }}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4"
          >
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Yeni Hesap Oluştur
          </h2>
          <p className="text-sm text-gray-600">MyERP ailesine katılın</p>
        </motion.div>

        <form onSubmit={handleRegister} className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white/50 backdrop-blur-sm"
              placeholder="Kullanıcı adınızı girin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white/50 backdrop-blur-sm"
              placeholder="Şifrenizi girin (en az 8 karakter)"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              disabled={loading}
              required
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded transition-all ${
                        passwordStrength.strength >= level
                          ? passwordStrength.strength <= 1
                            ? 'bg-red-500'
                            : passwordStrength.strength === 2
                            ? 'bg-yellow-500'
                            : passwordStrength.strength === 3
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${
                  passwordStrength.strength <= 1
                    ? 'text-red-600'
                    : passwordStrength.strength === 2
                    ? 'text-yellow-600'
                    : passwordStrength.strength === 3
                    ? 'text-blue-600'
                    : 'text-green-600'
                }`}>
                  {passwordStrength.message}
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">Şifre Tekrar</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white/50 backdrop-blur-sm"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Kaydediliyor...</span>
              </div>
            ) : (
              'Kayıt Ol'
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-600"
        >
          Zaten hesabınız var mı?{' '}
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="/login"
            className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700"
          >
            Giriş yapın
          </motion.a>
        </motion.div>
      </motion.div>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default Register;
