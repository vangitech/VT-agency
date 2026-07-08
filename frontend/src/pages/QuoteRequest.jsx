import { useState } from 'react';
import SEO from '../components/SEO';
import { Send, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

const projectTypes = [
  'Software Development',
  'Web Application',
  'Mobile App',
  'Cybersecurity Audit',
  'IT Consulting',
  'Cloud Migration',
  'UI/UX Design',
  'Digital Transformation',
  'Other',
];

const budgets = [
  'Under $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000+',
  'Not sure',
];

const timelines = [
  'ASAP (1-2 weeks)',
  '1-3 months',
  '3-6 months',
  '6+ months',
  'Not sure',
];

const QuoteRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/public/quote-request', formData);
      setSubmitted(true);
      setFormData({
        name: '', email: '', phone: '', company: '',
        projectType: '', budget: '', timeline: '', description: '',
      });
      setTimeout(() => setSubmitted(false), 8000);
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
        description="Get a tailored quote for your technology project. Vangitech offers software development, cybersecurity, IT consulting, and cloud solutions."
        url="https://vangitech.com/quote"
      />

      <section className="bg-gradient-to-br from-brand-darkBlue via-brand-blue to-brand-green py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/10 px-4 py-1.5 rounded-full mb-4">
            Let's Work Together
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            Request a Quote
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto text-white/80">
            Tell us about your project and we'll provide a tailored solution and quote within 24-48 hours.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {submitted && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4">
                <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-1">Quote Request Submitted!</h3>
                  <p className="text-green-700 text-sm">
                    Thank you! We've received your project details and our team will review them within 24-48 hours.
                    You'll receive a confirmation email shortly.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                  <FileText className="text-brand-blue" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Company Name"
                      value={formData.company}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType" className="text-sm font-medium text-gray-700">Project Type *</Label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors appearance-none"
                    required
                  >
                    <option value="">Select project type</option>
                    {projectTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-medium text-gray-700">Budget Range</Label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors appearance-none"
                    >
                      <option value="">Select budget range</option>
                      {budgets.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-sm font-medium text-gray-700">Timeline</Label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors appearance-none"
                    >
                      <option value="">Select timeline</option>
                      {timelines.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Project Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell us about your project, goals, and any specific requirements..."
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className="rounded-xl border-gray-200"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="blue"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 rounded-xl shadow-lg shadow-brand-blue/25"
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
        </div>
      </section>
    </div>
  );
};

export default QuoteRequest;
