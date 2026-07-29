import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      const t = setTimeout(() => setError('Missing setup token. Check your email for the full link.'), 0);
      return () => clearTimeout(t);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { toast.error('Enter your name'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await API.post('/auth/setup-superadmin', { token, password, name });
      localStorage.setItem('token', res.data.token);
      setDone(true);
      toast.success('Account created! Redirecting...');
      setTimeout(() => navigate('/vaccess/dashboard'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Setup failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green relative items-center justify-center overflow-hidden">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
            <Shield className="text-white" size={36} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Set Up Super Admin</h2>
          <p className="text-white/70 text-lg max-w-sm mx-auto leading-relaxed">
            Create your super admin account to manage the platform.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {done ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Account Created!</h2>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          ) : error && !token ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Invalid Link</h2>
              <p className="text-sm text-gray-500">{error}</p>
              <Link to="/vaccess/login" className="text-sm text-brand-blue font-medium hover:underline">
                Go to login
              </Link>
            </div>
          ) : (
            <>
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-green rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Set Up Super Admin</h1>
                <p className="text-gray-500 text-sm mt-1">Create your admin account</p>
              </div>

              <div className="hidden lg:block mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-500 text-sm mt-1">Set up your super admin credentials</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Your Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Evangel" className="h-12 rounded-xl border-gray-200" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="h-12 rounded-xl border-gray-200" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className="h-12 rounded-xl border-gray-200" required />
                </div>
                <Button type="submit" variant="blue" size="lg" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Super Admin Account'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSetup;
