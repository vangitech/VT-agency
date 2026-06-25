import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import rateLimit from 'express-rate-limit';
import PageContent from './models/PageContent.js';
import User from './models/User.js';
import { startNewsScheduler } from './services/newsScheduler.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vangitech API is running' });
});

// Serve frontend in production
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.use((req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Seed legal pages
const seedLegalPages = async () => {
  const legalPages = [
    {
      page: 'privacy',
      sections: {
        title: 'Privacy Policy',
        lastUpdated: 'June 2026',
        content: [
          {
            heading: 'Introduction',
            body: 'Your privacy is important to us. This privacy policy outlines how Vangitech collects, uses, and protects your personal information when you use our website and services. We are committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, you can be assured that it will only be used in accordance with this privacy statement.',
          },
          {
            heading: 'Information We Collect',
            body: 'We may collect the following information: your name and job title, contact information including email address, demographic information such as postcode, preferences and interests, and other information relevant to customer surveys and/or offers. We collect this information when you fill out forms on our website, correspond with us via email, or use our services.',
          },
          {
            heading: 'How We Use Your Information',
            body: 'We use your information to understand your needs and provide you with a better service. Specifically, we may use your information for internal record keeping, improvement of our products and services, periodic promotional emails about new services or offers, and market research purposes. We may contact you by email, phone, or mail.',
          },
          {
            heading: 'Data Security',
            body: 'We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure, we have implemented suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online. We use encryption, access controls, and regular security audits to protect your data.',
          },
          {
            heading: 'Cookies',
            body: 'Our website uses cookies to enhance your browsing experience. A cookie is a small file placed on your computer\'s hard drive that helps us analyze web traffic and improve our website. You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer.',
          },
          {
            heading: 'Your Rights',
            body: 'You have the right to request details of the personal information we hold about you. If you believe that any information we are holding on you is incorrect or incomplete, please contact us as soon as possible. We will promptly correct any information found to be incorrect. You also have the right to request deletion of your data.',
          },
          {
            heading: 'Contact Us',
            body: 'If you have any questions about this privacy policy or our data practices, please contact us at support@vangitech.com or write to House C18A FRSC Estate Lokogoma FCT-Abuja.',
          },
        ],
      },
    },
    {
      page: 'terms',
      sections: {
        title: 'Terms & Conditions',
        lastUpdated: 'June 2026',
        content: [
          {
            heading: 'Acceptance of Terms',
            body: 'By accessing and using this website and our services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our website or services. These terms apply to all visitors, users, and others who access or use our services.',
          },
          {
            heading: 'Services Description',
            body: 'Vangitech provides software development, cybersecurity, IT consulting, compliance audit, and related technology services. The specific scope, deliverables, timelines, and fees for each engagement will be defined in a separate service agreement or statement of work signed by both parties.',
          },
          {
            heading: 'Intellectual Property',
            body: 'Unless otherwise agreed in writing, all intellectual property rights developed during the course of our engagement shall remain the property of Vangitech until full payment has been received, at which point ownership transfers to the client. Our company name, logo, and branding materials may not be used without prior written consent.',
          },
          {
            heading: 'Confidentiality',
            body: 'Both parties agree to maintain the confidentiality of all proprietary information shared during the course of the engagement. This includes but is not limited to business processes, technical specifications, financial data, and trade secrets. Confidentiality obligations survive the termination of this agreement.',
          },
          {
            heading: 'Limitation of Liability',
            body: 'Vangitech shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from the use or inability to use our services. Our total liability for any claims under these terms shall not exceed the total fees paid by you for the specific service giving rise to the claim.',
          },
          {
            heading: 'Termination',
            body: 'Either party may terminate this agreement with written notice. Upon termination, you must pay all fees due up to the date of termination. Sections relating to intellectual property, confidentiality, and limitation of liability shall survive termination.',
          },
          {
            heading: 'Governing Law',
            body: 'These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Vangitech is registered. Any disputes arising from these terms shall be resolved through binding arbitration.',
          },
        ],
      },
    },
    {
      page: 'faq',
      sections: {
        title: 'Frequently Asked Questions',
        lastUpdated: 'June 2026',
        content: [
          {
            heading: 'What services does Vangitech offer?',
            body: 'We offer a comprehensive range of technology services including custom software development, cybersecurity solutions, IT consulting, compliance audits (ISO 27001 & PCI DSS), fintech and edutech solutions, and hardware/software maintenance support. Our team has expertise across multiple industries and technology stacks.',
          },
          {
            heading: 'How can I get a quote for my project?',
            body: 'Simply fill out the contact form on our website or email us at support@vangitech.com with details about your project. Our team will review your requirements and get back to you within 24-48 hours with a preliminary estimate. For complex projects, we may schedule a discovery call to better understand your needs.',
          },
          {
            heading: 'What industries do you serve?',
            body: 'We serve a diverse range of industries including finance and banking, healthcare, education and edutech, technology and SaaS, government and public sector, and e-commerce. Our solutions are tailored to meet the specific regulatory and operational requirements of each industry.',
          },
          {
            heading: 'What is your typical project timeline?',
            body: 'Project timelines vary depending on scope and complexity. A typical web application project may take 8-16 weeks, while larger enterprise solutions can take 3-6 months or more. We work using agile methodologies, delivering incremental value throughout the development process. A detailed timeline is provided during the proposal stage.',
          },
          {
            heading: 'Do you offer post-launch support?',
            body: 'Yes, we offer comprehensive post-launch support and maintenance packages. This includes bug fixes, performance monitoring, security updates, and feature enhancements. Our support team is available during business hours with options for 24/7 premium support for critical applications.',
          },
          {
            heading: 'How do you ensure data security?',
            body: 'Security is built into every aspect of our development process. We follow industry best practices including secure coding standards, regular penetration testing, encryption at rest and in transit, access control mechanisms, and compliance with relevant regulations (GDPR, HIPAA, PCI DSS). We also provide security audit services for existing systems.',
          },
          {
            heading: 'What technologies do you use?',
            body: 'Our technology stack includes modern frameworks and tools such as React, Next.js, Vue.js, Node.js, Python, Go, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, and many more. We select the best technology for each project based on your specific requirements, scalability needs, and team expertise.',
          },
          {
            heading: 'How do I get started working with Vangitech?',
            body: 'Getting started is easy! Contact us through our website, email, or phone. We will schedule an initial consultation to understand your needs, provide a proposal and timeline, and once agreed, our team will begin work. We maintain transparent communication throughout the project with regular updates and milestone reviews.',
          },
        ],
      },
    },
    {
      page: 'policy',
      sections: {
        title: 'Cookie Policy',
        lastUpdated: 'June 2026',
        content: [
          {
            heading: 'What Are Cookies',
            body: 'Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, provide a better browsing experience, and give website owners information about how their site is being used. Cookies cannot run programs or deliver viruses to your computer.',
          },
          {
            heading: 'How We Use Cookies',
            body: 'Vangitech uses cookies for the following purposes: Essential cookies that are necessary for the website to function properly, analytics cookies that help us understand how visitors interact with our website, preference cookies that remember your settings and preferences, and marketing cookies that track your browsing habits to deliver relevant advertisements.',
          },
          {
            heading: 'Types of Cookies We Use',
            body: 'Session cookies: These are temporary cookies that expire when you close your browser. They enable the website to remember your actions during a single browsing session. Persistent cookies: These remain on your device for a set period or until you delete them. They help us remember your preferences for future visits.',
          },
          {
            heading: 'Third-Party Cookies',
            body: 'We may also use third-party cookies from trusted partners for analytics and marketing purposes. These include Google Analytics for understanding website traffic and usage patterns, and social media platforms for content sharing. These third parties have their own privacy policies governing the use of your information.',
          },
          {
            heading: 'Managing Cookies',
            body: 'You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer. You can also delete cookies that have already been stored on your device. Please note that disabling certain cookies may affect the functionality of our website.',
          },
          {
            heading: 'Changes to This Policy',
            body: 'We may update this cookie policy from time to time to reflect changes in our practices or for legal reasons. We encourage you to review this page periodically for the latest information. The date of the last update is displayed at the top of this page.',
          },
          {
            heading: 'Contact',
            body: 'If you have any questions about our use of cookies, please contact us at support@vangitech.com. We are happy to provide more information about how we handle your data and privacy.',
          },
        ],
      },
    },
  ];

  for (const page of legalPages) {
    await PageContent.findOneAndUpdate(
      { page: page.page },
      { $setOnInsert: { sections: page.sections } },
      { upsert: true, returnDocument: 'after' }
    );
  }
  console.log('Legal pages seeded');
};

seedLegalPages().catch(console.error);

const seedSuperAdmin = async () => {
  const exists = await User.findOne({ email: 'evangel@vangitech.com' });
  if (!exists) {
    await User.create({
      name: 'Evangel',
      email: 'evangel@vangitech.com',
      password: 'admin123',
      role: 'superadmin',
    });
    console.log('Superadmin seeded');
  }
};
seedSuperAdmin().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startNewsScheduler();
});