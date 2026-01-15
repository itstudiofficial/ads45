import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Terms and Conditions</h1>
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using Adspredia, you agree to be bound by these terms. If you do not agree, please do not use our services.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. User Conduct</h2>
          <p>Users must not create multiple accounts or use automated systems (bots) to complete tasks. Any such activity will result in immediate account termination and forfeiture of earnings.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. Payments & Withdrawals</h2>
          <p>Minimum withdrawal is $3.00. We reserve the right to verify every task completion before releasing funds. This process typically takes up to 48 business hours.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Referral Program</h2>
          <p>Referral commissions are paid only on valid earnings of active users. Ghost accounts created for referral bonuses will be banned.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;