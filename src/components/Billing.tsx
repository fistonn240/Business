import React from 'react';
import { CreditCard, Check, Shield, Globe, Zap, ArrowRight, Wallet, Banknote, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Billing() {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      desc: 'Perfect for individuals starting their strategic journey.',
      features: ['Up to 5 active goals', 'Basic AI Coach insights', 'Strategy Canvas access', 'Community support'],
      cta: 'Current Plan',
      current: true,
    },
    {
      name: 'Professional',
      price: '$29',
      desc: 'Advanced tools for growing businesses and serious achievers.',
      features: ['Unlimited goals', 'Priority AI Business Coach', 'Advanced Strategy Analytics', 'Team collaboration', 'PDF Exports'],
      cta: 'Upgrade to Pro',
      current: false,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      desc: 'Custom solutions for large-scale organizations and teams.',
      features: ['Custom AI model training', 'Dedicated account manager', 'SSO & Advanced Security', 'API Access', 'White-label reports'],
      cta: 'Upgrade to Enterprise',
      current: false,
    },
  ];

  const handleUpgrade = async (planName: string, price: string) => {
    if (price === '$0') return;
    
    setIsProcessing(planName);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName, price }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setIsProcessing(null);
    }
  };

  const paymentMethods = [
    { name: 'Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, AMEX' },
    { name: 'Digital Wallets', icon: Wallet, desc: 'Apple Pay, Google Pay' },
    { name: 'Instant Payments (IPA)', icon: Zap, desc: 'UPI, PIX, Instant Bank' },
    { name: 'Bank Transfer', icon: Banknote, desc: 'Direct ACH/SEPA transfers' },
    { name: 'Crypto', icon: Globe, desc: 'BTC, ETH, USDC' },
  ];

  return (
    <div className="space-y-12">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Pricing & Billing</h1>
        <p className="text-slate-500 text-lg">Choose the perfect plan to accelerate your business growth and achieve your life goals.</p>
      </header>

      {success && (
        <div className="max-w-2xl mx-auto bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-800">
          <Check className="w-5 h-5" />
          <p className="font-medium">Payment successful! Your account has been upgraded.</p>
        </div>
      )}

      {canceled && (
        <div className="max-w-2xl mx-auto bg-slate-100 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 text-slate-700">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Payment canceled. No charges were made.</p>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-800">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div key={i} className={`relative bg-white p-8 rounded-3xl border ${plan.popular ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-100'} shadow-sm flex flex-col`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{plan.desc}</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="bg-emerald-50 p-1 rounded-full">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgrade(plan.name, plan.price)}
              disabled={plan.current || isProcessing === plan.name}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                plan.current 
                  ? 'bg-slate-100 text-slate-500 cursor-default' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-100'
              }`}
            >
              {isProcessing === plan.name && <Loader2 className="w-5 h-5 animate-spin" />}
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Methods Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Transactions</h2>
            <p className="text-slate-500">We support multiple payment methods to ensure a smooth and secure checkout experience for customers worldwide.</p>
          </div>
          <div className="flex items-center gap-4">
            <Shield className="w-12 h-12 text-indigo-600 bg-indigo-50 p-3 rounded-2xl" />
            <div>
              <p className="font-bold text-slate-900">Bank-Level Security</p>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">256-bit SSL Encryption</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentMethods.map((method, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
              <method.icon className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors mb-4" />
              <h4 className="font-bold text-slate-900 mb-1">{method.name}</h4>
              <p className="text-xs text-slate-500">{method.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-12 border-t flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Zap className="w-10 h-10 text-amber-500" />
            <div>
              <p className="font-bold text-slate-900">Instant Activation</p>
              <p className="text-sm text-slate-500">Your Pro features are unlocked immediately after payment.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
            Learn more about our billing cycles <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
