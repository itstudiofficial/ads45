
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
        <p>Last updated: May 12, 2024</p>
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Information Collection</h2>
          <p>We collect information you provide directly, such as your name, email address, and payment details when you create an account and request withdrawals.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Use of Information</h2>
          <p>We use your data to manage your account, process payments, and improve our services. We do not sell your personal data to third parties.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Data Security</h2>
          <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
