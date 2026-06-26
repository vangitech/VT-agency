import { useState, useEffect } from 'react';
import API from '../../../api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Shield, Loader2, Key, FileText, History,
  CheckCircle, XCircle, AlertTriangle, Smartphone,
  Eye, EyeOff, Copy, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SecurityTab = () => {
  const [activeSection, setActiveSection] = useState('2fa');
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [verifyToken, setVerifyToken] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      setTwoFactorEnabled(payload.twoFactorEnabled || false);
    } catch {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await API.get('/security/audit-logs', { params: { limit: 50 } });
      setAuditLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
    } catch {} finally { setLoadingAudit(false); }
  };

  useEffect(() => { fetchUser(); fetchAuditLogs(); }, []);

  const handleGenerate2FA = async () => {
    setLoading2FA(true);
    try {
      const res = await API.post('/security/2fa/generate');
      setTwoFactorData(res.data);
      toast.success('2FA secret generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate 2FA');
    } finally { setLoading2FA(false); }
  };

  const handleVerify2FA = async () => {
    if (!verifyToken.trim()) { toast.error('Enter the code'); return; }
    try {
      await API.post('/security/2fa/verify', { token: verifyToken });
      toast.success('2FA enabled successfully');
      setTwoFactorEnabled(true);
      setTwoFactorData(null);
      setVerifyToken('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Disable two-factor authentication?')) return;
    try {
      await API.post('/security/2fa/disable', { token: verifyToken || undefined });
      toast.success('2FA disabled');
      setTwoFactorEnabled(false);
      setTwoFactorData(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disable');
    }
  };

  const sections = [
    { id: '2fa', label: 'Two-Factor Auth', icon: Key },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'compliance', label: 'Compliance', icon: Shield },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"><Shield size={18} className="text-white" /></div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Security & Compliance</h2>
          <p className="text-xs text-gray-500">Two-factor authentication, audit logs, and compliance documentation</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === s.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'}`}>
              <Icon size={16} /> {s.label}
            </button>
          );
        })}
      </div>

      {activeSection === '2fa' && (
        <div className="space-y-4 max-w-lg">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${twoFactorEnabled ? 'bg-green-50' : 'bg-amber-50'}`}>
                    {twoFactorEnabled ? <CheckCircle size={18} className="text-green-600" /> : <Smartphone size={18} className="text-amber-600" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-500">{twoFactorEnabled ? 'Active — extra security enabled' : 'Not configured'}</p>
                  </div>
                </div>
              </div>

              {!twoFactorEnabled && !twoFactorData && (
                <Button variant="blue" onClick={handleGenerate2FA} disabled={loading2FA} className="rounded-xl">
                  {loading2FA ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Key size={14} className="mr-1.5" />}
                  Set Up 2FA
                </Button>
              )}

              {twoFactorData && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Scan with Authenticator App</p>
                    <p className="text-xs text-gray-500 mb-3">Open Google Authenticator, Authy, or similar and scan the QR code, or enter the key manually.</p>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
                      <code className="text-sm font-mono flex-1 break-all">{showSecret ? twoFactorData.secret : '••••••••••••••••'}</code>
                      <button onClick={() => setShowSecret(!showSecret)} className="text-gray-400 hover:text-gray-600">
                        {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(twoFactorData.secret); toast.success('Copied!'); }} className="text-gray-400 hover:text-gray-600">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Verification Code</Label>
                    <div className="flex gap-2">
                      <Input value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} placeholder="Enter 6-digit code" className="h-10 rounded-xl flex-1 font-mono" maxLength={6} />
                      <Button variant="blue" onClick={handleVerify2FA} className="rounded-xl">Verify</Button>
                    </div>
                  </div>
                </div>
              )}

              {twoFactorEnabled && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
                    <CheckCircle size={16} /> Two-factor authentication is active
                  </div>
                  <Button variant="outline" onClick={handleDisable2FA} className="rounded-xl text-red-500 border-red-200 hover:bg-red-50">
                    <XCircle size={14} className="mr-1.5" /> Disable 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Permission Level</h3>
              <p className="text-xs text-gray-500 mb-2">Your current role determines what you can access in the CRM.</p>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                <p>Role-based access controls ensure that managers see everything while team members see only their own data.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'audit' && (
        <div>
          <Card className="border border-gray-100 shadow-sm">
            <div className="max-h-[65vh] overflow-y-auto">
              {loadingAudit ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-blue animate-spin" /></div>
              ) : !Array.isArray(auditLogs) || auditLogs.length === 0 ? (
                <div className="text-center py-12"><History size={36} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">No audit logs yet</p></div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Resource</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr></thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-xs text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{log.user?.name || 'System'}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{log.action.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{log.resource || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            log.severity === 'critical' ? 'bg-red-50 text-red-600' :
                            log.severity === 'warning' ? 'bg-amber-50 text-amber-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>{log.severity}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 max-w-[200px] truncate">
                          {log.details ? JSON.stringify(log.details).substring(0, 50) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'compliance' && (
        <div className="space-y-4">
          <Card className="border border-gray-100 shadow-sm border-l-4 border-l-emerald-400">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={20} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">SOC 2 Compliance</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Vangitech maintains SOC 2 compliance standards to ensure the security, availability, and confidentiality of customer data.
                Our systems are designed with industry-standard security controls including:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {['Encryption at rest (AES-256) and in transit (TLS 1.3)', 'Access controls with role-based permissions', 'Continuous monitoring and incident response', 'Regular security audits and penetration testing', 'Employee security training and background checks'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm border-l-4 border-l-blue-400">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <FileText size={20} className="text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">GDPR & CCPA Compliance</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                We are committed to protecting the privacy rights of individuals under the General Data Protection Regulation (GDPR)
                and the California Consumer Privacy Act (CCPA).
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {['Right to access your personal data', 'Right to rectification of inaccurate data', 'Right to erasure ("right to be forgotten")', 'Right to restrict or object to processing', 'Data portability upon request', 'Opt-out options for marketing communications'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm border-l-4 border-l-amber-400">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={20} className="text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Data Security Measures</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {['SSL/TLS encryption for all data in transit', 'AES-256 encryption for data at rest', 'Two-factor authentication (2FA) for all accounts', 'Role-based access control (RBAC)', 'Comprehensive audit logging', 'Automated backups with disaster recovery'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Encryption & Data Handling</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">In Transit</p>
                  <p className="text-sm text-gray-700">TLS 1.3 / HTTPS</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">At Rest</p>
                  <p className="text-sm text-gray-700">AES-256 Encryption</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Backup</p>
                  <p className="text-sm text-gray-700">Encrypted daily backups</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Authentication</p>
                  <p className="text-sm text-gray-700">JWT + 2FA (TOTP)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SecurityTab;
