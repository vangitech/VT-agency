import { useState } from 'react';
import SEO from '../components/SEO';
import {
  Send, FileText, CheckCircle, Upload, Building2, Globe,
  Users, CalendarClock, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

const industries = [
  'Banking/Fintech', 'E-commerce', 'Healthcare', 'Government',
  'Logistics', 'Oil & Gas', 'Other',
];

const companySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees', '200+ employees',
];

const budgets = [
  'Under ₦5M', '₦5M – ₦15M', '₦15M – ₦50M', '₦50M+',
];

const timelines = [
  'Emergency/Immediate', 'Within 1 month', '1-3 months', '3+ months',
];

const categories = [
  { value: '', label: 'Select a category' },
  { value: 'Software Development', label: 'Software Development' },
  { value: 'Cyber-Security', label: 'Cyber-Security' },
  { value: 'ISO Implementation', label: 'ISO Implementation' },
  { value: 'Fintech Solutions', label: 'Fintech Solutions' },
];

// Checkbox group helper
const CheckboxGroup = ({ label, options, selected, onChange }) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-gray-700">{label}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const display = typeof opt === 'string' ? opt : opt.label;
        const checked = selected.includes(value);
        return (
          <label
            key={value}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              checked
                ? 'border-brand-blue bg-brand-blue/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              checked={checked}
              onChange={() => {
                const next = checked
                  ? selected.filter((s) => s !== value)
                  : [...selected, value];
                onChange(next);
              }}
            />
            <span className="text-sm text-gray-900">{display}</span>
          </label>
        );
      })}
    </div>
  </div>
);

// Radio group helper
const RadioGroup = ({ label, options, value, onChange, name }) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-gray-700">{label}</p>
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const d = typeof opt === 'string' ? opt : opt.label;
        const checked = value === v;
        return (
          <label
            key={v}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
              checked
                ? 'border-brand-blue bg-brand-blue/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name={name}
              className="w-4 h-4 text-brand-blue focus:ring-brand-blue border-gray-300"
              checked={checked}
              onChange={() => onChange(v)}
            />
            <span className="text-sm text-gray-900">{d}</span>
          </label>
        );
      })}
    </div>
  </div>
);

const SelectField = ({ label, options, value, onChange, placeholder, required }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl border border-gray-200 bg-white pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors"
        required={required}
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const QuoteRequest = () => {
  const [formData, setFormData] = useState({
    // Baseline
    name: '', role: '', company: '', website: '', email: '', phone: '',
    industry: '', companySize: '', budget: '', timeline: '',
    // Category
    category: '',
    // Software Development
    softwareScope: [], targetPlatforms: [], coreFeatures: [], preferredTechStack: '',
    // Cyber Security
    securityNeed: '', infrastructureType: [], complianceFramework: [], recentAttack: '',
    // ISO Implementation
    targetCertification: [], currentStatus: '', locationsInScope: '',
    // Fintech Solutions
    solutionCategory: [], regulatoryLicenseStatus: '', expectedTransactionVolume: '',
    // Closeout
    additionalSpecs: '',
  });

  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (field) => (values) => {
    setFormData({ ...formData, [field]: values });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 25 * 1024 * 1024) {
        toast.error('File must be under 25MB');
        e.target.value = '';
        return;
      }
      setFile(f);
    }
  };

  const resetCategoryFields = (category) => {
    const base = {
      softwareScope: [], targetPlatforms: [], coreFeatures: [], preferredTechStack: '',
      securityNeed: '', infrastructureType: [], complianceFramework: [], recentAttack: '',
      targetCertification: [], currentStatus: '', locationsInScope: '',
      solutionCategory: [], regulatoryLicenseStatus: '', expectedTransactionVolume: '',
    };
    return { ...formData, ...base, category };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please select a project category');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fd.append(key, JSON.stringify(value));
        } else {
          fd.append(key, value);
        }
      });
      if (file) fd.append('document', file);

      await API.post('/public/quote-request', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(true);
      setFormData({
        name: '', role: '', company: '', website: '', email: '', phone: '',
        industry: '', companySize: '', budget: '', timeline: '',
        category: '',
        softwareScope: [], targetPlatforms: [], coreFeatures: [], preferredTechStack: '',
        securityNeed: '', infrastructureType: [], complianceFramework: [], recentAttack: '',
        targetCertification: [], currentStatus: '', locationsInScope: '',
        solutionCategory: [], regulatoryLicenseStatus: '', expectedTransactionVolume: '',
        additionalSpecs: '',
      });
      setFile(null);
      setTimeout(() => setSubmitted(false), 10000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quote request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-16 -mt-20 md:pt-20">
      <SEO
        title="Request a Quote"
        description="Get a tailored quote for your technology project. Vangitech offers software development, cybersecurity, ISO implementation, and fintech solutions."
        url="https://vangitech.com/quote"
      />

      <section className="bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full mb-4">
            Let's Build Together
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            Request a Quote
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto text-white/80">
            Tell us about your project. A solutions architect will reach out within 24–48 hours with a tailored proposal.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {submitted && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4">
                <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-1">Quote Request Submitted!</h3>
                  <p className="text-green-700 text-sm">
                    Thank you! We've received your project details and a solutions architect is reviewing them.
                    You'll receive a confirmation email shortly and we'll reach out within 24–48 hours.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* === Universal Baseline === */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10 mb-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                    <Building2 className="text-brand-blue" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                    <Input id="name" name="name" placeholder="Jane Doe" value={formData.name} onChange={handleChange} className="h-12 rounded-xl border-gray-200" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role / Title</Label>
                    <Input id="role" name="role" placeholder="Chief Technology Officer" value={formData.role} onChange={handleChange} className="h-12 rounded-xl border-gray-200" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="jane@company.com" value={formData.email} onChange={handleChange} className="h-12 rounded-xl border-gray-200" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+234 800 000 0000" value={formData.phone} onChange={handleChange} className="h-12 rounded-xl border-gray-200" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company Name</Label>
                    <Input id="company" name="company" placeholder="Vangitech Limited" value={formData.company} onChange={handleChange} className="h-12 rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium text-gray-700">Company Website</Label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input id="website" name="website" type="url" placeholder="https://company.com" value={formData.website} onChange={handleChange} className="h-12 rounded-xl border-gray-200 pl-10" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  <SelectField label="Industry / Sector" options={industries} value={formData.industry} onChange={(v) => setFormData({ ...formData, industry: v })} placeholder="Select industry" />
                  <SelectField label="Company Size" options={companySizes} value={formData.companySize} onChange={(v) => setFormData({ ...formData, companySize: v })} placeholder="Select company size" />
                </div>
              </div>

              {/* === Project Overview === */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10 mb-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                    <FileText className="text-brand-blue" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
                </div>

                <div className="space-y-2 mb-5">
                  <Label className="text-sm font-medium text-gray-700">Project Category *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.filter((c) => c.value).map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.category === cat.value
                            ? 'border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          className="w-4 h-4 text-brand-blue focus:ring-brand-blue border-gray-300"
                          checked={formData.category === cat.value}
                          onChange={() => setFormData(resetCategoryFields(cat.value))}
                        />
                        <span className="text-sm font-medium text-gray-900">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  <SelectField label="Budget Range" options={budgets} value={formData.budget} onChange={(v) => setFormData({ ...formData, budget: v })} placeholder="Select budget range" />
                  <SelectField label="Target Timeline" options={timelines} value={formData.timeline} onChange={(v) => setFormData({ ...formData, timeline: v })} placeholder="Select timeline" />
                </div>
              </div>

              {/* === Dynamic Sections === */}

              {formData.category === 'Software Development' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Software Development Details</h3>
                  <div className="space-y-6">
                    <CheckboxGroup
                      label="Project Scope"
                      options={['New Product Build', 'Upgrading Existing Software', 'API Integration/Backend']}
                      selected={formData.softwareScope}
                      onChange={handleCheckbox('softwareScope')}
                    />
                    <CheckboxGroup
                      label="Target Platforms"
                      options={['Web App', 'Mobile App (iOS/Android)', 'Desktop App']}
                      selected={formData.targetPlatforms}
                      onChange={handleCheckbox('targetPlatforms')}
                    />
                    <CheckboxGroup
                      label="Core Technical Features Needed"
                      options={['User Authentication', 'Third-Party API Integrations', 'Admin Dashboard', 'Advanced Reporting/Analytics', 'Real-time Chat/Notifications']}
                      selected={formData.coreFeatures}
                      onChange={handleCheckbox('coreFeatures')}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="preferredTechStack" className="text-sm font-medium text-gray-700">Preferred Tech Stack (Optional)</Label>
                      <Input id="preferredTechStack" name="preferredTechStack" placeholder="e.g., React and Node.js" value={formData.preferredTechStack} onChange={handleChange} className="h-12 rounded-xl border-gray-200" />
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'Cyber-Security' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Cyber-Security Details</h3>
                  <div className="space-y-6">
                    <SelectField
                      label="Primary Security Need"
                      options={[
                        'Vulnerability Assessment/Penetration Testing',
                        'Incident Response/Hack Remediation',
                        'Managed Detection & Response',
                        'Employee Security Training',
                      ]}
                      value={formData.securityNeed}
                      onChange={(v) => setFormData({ ...formData, securityNeed: v })}
                      placeholder="Select primary need"
                    />
                    <CheckboxGroup
                      label="Infrastructure Type"
                      options={['Cloud Infrastructure (AWS/Azure/GCP)', 'On-Premise Servers', 'Hybrid', 'Web/Mobile Applications']}
                      selected={formData.infrastructureType}
                      onChange={handleCheckbox('infrastructureType')}
                    />
                    <CheckboxGroup
                      label="Compliance Framework Needed"
                      options={[
                        'NDPA (Nigeria Data Protection Act)',
                        'PCI-DSS',
                        'ISO 27001',
                        'None/Unsure',
                      ]}
                      selected={formData.complianceFramework}
                      onChange={handleCheckbox('complianceFramework')}
                    />
                    <RadioGroup
                      label="Has your system suffered a recent attack?"
                      options={['Yes', 'No', 'Unsure']}
                      value={formData.recentAttack}
                      onChange={(v) => setFormData({ ...formData, recentAttack: v })}
                      name="recentAttack"
                    />
                  </div>
                </div>
              )}

              {formData.category === 'ISO Implementation' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">ISO Implementation Details</h3>
                  <div className="space-y-6">
                    <CheckboxGroup
                      label="Target Certification"
                      options={[
                        'ISO 27001 (Information Security)',
                        'ISO 9001 (Quality Management)',
                        'ISO 22301 (Business Continuity)',
                        'Other/Unsure',
                      ]}
                      selected={formData.targetCertification}
                      onChange={handleCheckbox('targetCertification')}
                    />
                    <SelectField
                      label="Current Status"
                      options={[
                        'Starting from scratch',
                        'Partially implemented',
                        'Preparing for a final audit',
                        'Re-certification',
                      ]}
                      value={formData.currentStatus}
                      onChange={(v) => setFormData({ ...formData, currentStatus: v })}
                      placeholder="Select current status"
                    />
                    <div className="space-y-2">
                      <Label htmlFor="locationsInScope" className="text-sm font-medium text-gray-700">Number of Offices/Locations in Scope</Label>
                      <Input id="locationsInScope" name="locationsInScope" type="number" min="1" placeholder="e.g., 3" value={formData.locationsInScope} onChange={handleChange} className="h-12 rounded-xl border-gray-200" />
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'Fintech Solutions' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Fintech Solutions Details</h3>
                  <div className="space-y-6">
                    <CheckboxGroup
                      label="Solution Category"
                      options={[
                        'Digital Wallet/Payment Gateway',
                        'Core Banking Integration',
                        'Micro-Lending Platform',
                        'Escrow System',
                        'Remittance/Cross-Border Payments',
                      ]}
                      selected={formData.solutionCategory}
                      onChange={handleCheckbox('solutionCategory')}
                    />
                    <SelectField
                      label="Regulatory License Status"
                      options={[
                        'Already licensed by CBN',
                        'Application in progress',
                        'Looking for a white-label partner',
                        'Unsure',
                      ]}
                      value={formData.regulatoryLicenseStatus}
                      onChange={(v) => setFormData({ ...formData, regulatoryLicenseStatus: v })}
                      placeholder="Select license status"
                    />
                    <SelectField
                      label="Expected Transaction Volume"
                      options={[
                        'Low/Testing',
                        'Under 10k transactions/month',
                        '10k-100k transactions/month',
                        '100k+ transactions/month',
                      ]}
                      value={formData.expectedTransactionVolume}
                      onChange={(v) => setFormData({ ...formData, expectedTransactionVolume: v })}
                      placeholder="Select volume"
                    />
                  </div>
                </div>
              )}

              {/* === Closeout === */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10 mb-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                    <Upload className="text-brand-blue" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Supporting Materials</h2>
                </div>

                <div className="space-y-2 mb-6">
                  <Label htmlFor="document" className="text-sm font-medium text-gray-700">Project Brief / Documentation</Label>
                  <p className="text-xs text-gray-500">Accepts PDF, DOCX, or ZIP files up to 25MB</p>
                  <div className="relative">
                    <input
                      id="document"
                      type="file"
                      accept=".pdf,.docx,.zip,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-colors ${
                      file ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}>
                      <Upload size={20} className="text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        {file ? (
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PDF, DOCX, or ZIP (max 25MB)</p>
                          </>
                        )}
                      </div>
                      {file && (
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalSpecs" className="text-sm font-medium text-gray-700">Additional Specifications</Label>
                  <Textarea
                    id="additionalSpecs"
                    name="additionalSpecs"
                    placeholder="Tell us more about your specific business objectives, unique requirements, or any other details that will help us understand your project better..."
                    rows={5}
                    value={formData.additionalSpecs}
                    onChange={handleChange}
                    className="rounded-xl border-gray-200"
                  />
                </div>
              </div>

              {/* === Submit === */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="blue"
                  size="lg"
                  className="h-12 px-10 rounded-xl shadow-lg shadow-brand-blue/25"
                  disabled={submitting}
                >
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      Submit Quote Request <Send size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuoteRequest;
