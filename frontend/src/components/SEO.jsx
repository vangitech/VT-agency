import { Helmet } from 'react-helmet-async';

const defaultTitle = 'Vangitech — Software Development, Cybersecurity & IT Consulting';
const defaultDescription = 'Custom software development, cybersecurity, compliance audits, and IT consulting. Empowering businesses with innovative technology solutions.';
const siteUrl = 'https://vangitech.com';
const defaultImage = `${siteUrl}/favicon.svg`;

const SEO = ({ title, description, image, url, type = 'website' }) => {
  const pageTitle = title ? `${title} | Vangitech` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageUrl = url || siteUrl;
  const pageImage = image || defaultImage;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <link rel="canonical" href={pageUrl} />
    </Helmet>
  );
};

export default SEO;