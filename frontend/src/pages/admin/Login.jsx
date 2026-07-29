import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lock, Mail, Eye, EyeOff, RefreshCw } from 'lucide-react';
import API from '../../api';
import toast from 'react-hot-toast';
import logoSrc from '../../assets/images/Vangitech Logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleResendSetup = async () => {
    setResending(true);
    try {
      const res = await API.post('/auth/resend-setup');
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend setup email');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/vaccess/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message;
      if (msg) {
        toast.error(msg);
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot reach server. Check your connection or try again later.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green relative items-center justify-center overflow-hidden">
        {/* Abstract decorative circles */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <img src={logoSrc} alt="Vangitech" className="w-28 h-28 object-contain mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
          <p className="text-white/70 text-lg max-w-sm mx-auto leading-relaxed">
            Sign in to your admin dashboard to manage your website content and settings.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src={logoSrc} alt="Vangitech" className="w-20 h-20 object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your dashboard</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus:border-brand-blue focus:ring-brand-blue/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Link to="/vaccess/forgot-password" className="text-xs text-brand-blue hover:text-brand-blue/80 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus:border-brand-blue focus:ring-brand-blue/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="blue"
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30 transition-all"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={handleResendSetup}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-blue font-medium transition-colors"
            >
              <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Sending...' : "Didn't receive setup email? Resend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
