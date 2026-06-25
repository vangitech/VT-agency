import React from 'react';
import { imageUrl } from '../../api';

const fallbackClients = [
  { _id: '1', name: 'TechVault Inc.' },
  { _id: '2', name: 'FinEdge Solutions' },
  { _id: '3', name: 'MedCore Health' },
  { _id: '4', name: 'EduPrime' },
  { _id: '5', name: 'CloudBase Systems' },
];

const Clients = ({ clients }) => {
  const items = Array.isArray(clients) && clients.length > 0 ? clients : fallbackClients;

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-blue bg-brand-blue/5 px-4 py-1.5 rounded-full mb-4">
            Our Partners
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-brand-blue">Companies</span>{' '}
            <span className="text-brand-green">We've Worked With</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Trusted by leading organizations across various industries.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {items.map((client) => (
            <div
              key={client._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 flex items-center justify-center min-h-[130px] group border border-gray-100"
            >
              {client.logo ? (
                <img
                  src={imageUrl(client.logo)}
                  alt={client.name}
                  className="max-w-full h-24 object-contain transition-all duration-300"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-500 group-hover:text-brand-blue transition-colors text-center">
                  {client.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
