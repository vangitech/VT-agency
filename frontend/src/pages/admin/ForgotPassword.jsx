import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Mail, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import logoSrc from '../../assets/images/Vangitech Logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [contactSuperAdmin, setContactSuperAdmin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter your email address');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.message?.includes('Contact your super admin')) {
        setContactSuperAdmin(true);
      } else {
        setSent(true);
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(msg || 'Failed to send reset email');
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
          <img src={logoSrc} alt="Vangitech" className="w-24 h-24 object-contain mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">Forgot Password?</h2>
          <p className="text-white/70 text-lg max-w-sm mx-auto leading-relaxed">
            No worries. Enter your email and we will send you a reset link.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <img src={logoSrc} alt="Vangitech" className="w-16 h-16 object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
          </div>

          {contactSuperAdmin ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert size={32} className="text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Contact Your Super Admin</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Regular admins cannot reset their password via email. Please contact your
                super admin to have your password reset.
              </p>
              <Link
                to="/vaccess/login"
                className="inline-flex items-center gap-1.5 text-sm text-brand-blue font-medium hover:text-brand-blue/80 mt-4"
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          ) : sent ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Check Your Inbox</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                If an account exists for <strong className="text-gray-700">{email}</strong>,
                we have sent a password reset link. Please check your email and click the link to proceed.
              </p>
              <p className="text-xs text-gray-400">Did not receive the email? Check your spam folder or try again.</p>
              <Link
                to="/vaccess/login"
                className="inline-flex items-center gap-1.5 text-sm text-brand-blue font-medium hover:text-brand-blue/80 mt-4"
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="evangel@vangitech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus:border-brand-blue focus:ring-brand-blue/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="blue"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-brand-blue/25 hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Link
                  to="/vaccess/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
