import React, { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Check, Zap, Star, Shield, Globe, Users, BarChart3, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroButton } from '@/components/ui/hero-button';

const PricingPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Business') {
      navigate('/onboarding');
    } else {
      navigate('/auth');
    }
  };

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals starting their digital journey.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Star,
      color: "blue",
      features: [
        { category: "Core Elements", items: ["1 Active Profile", "Standard Templates", "Basic Analytics"] },
        { category: "Advanced Features", items: ["Patra Branding", "QR Code Sharing"] },
        { category: "Support", items: ["Community Support"] }
      ],
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      description: "For professionals who want to stand out from the crowd.",
      monthlyPrice: 12,
      yearlyPrice: 10,
      icon: Zap,
      color: "violet",
      features: [
        { category: "Core Elements", items: ["10 Active Profiles", "Premium Templates", "Advanced Analytics"] },
        { category: "Advanced Features", items: ["Connect Custom Domain", "Early Feature Access", "No Patra Branding"] },
        { category: "Support", items: ["Priority Email Support", "Advanced SEO Tools"] }
      ],
      buttonText: "Try Pro Now",
      popular: true
    },
    {
      name: "Business",
      description: "The ultimate solution for teams and growing organizations.",
      monthlyPrice: 49,
      yearlyPrice: 40,
      icon: Shield,
      color: "emerald",
      features: [
        { category: "Core Elements", items: ["Unlimited Profiles", "Exclusive Templates", "Full Analytics Suite"] },
        { category: "Advanced Features", items: ["Team Management Hub", "API Access", "White-label Solution"] },
        { category: "Support", items: ["24/7 Priority Support", "Dedicated Account Manager"] }
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-violet-100 selection:text-violet-900">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-violet-50/50 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm mb-8"
            >
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-slate-600">Flexible plans for every need</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight"
            >
              Ready to elevate your <br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">networking game?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto mb-10"
            >
              Choose the plan that fits your ambition. From simple digital cards to full-scale enterprise solutions.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-7 bg-slate-200 rounded-full p-1 transition-colors hover:bg-slate-300"
              >
                <motion.div
                  animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Yearly</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Save 20%</span>
              </div>
            </motion.div>
          </div>

          {/* Pricing Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={`relative group bg-white rounded-3xl p-8 border ${plan.popular ? 'border-violet-200 shadow-2xl' : 'border-slate-200 shadow-xl'} transition-all duration-300 hover:translate-y-[-8px]`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-${plan.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <plan.icon className={`w-7 h-7 text-${plan.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">$</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={billingCycle}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-5xl font-bold text-slate-900"
                      >
                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-slate-400 font-medium">/mo</span>
                  </div>
                  {billingCycle === 'yearly' && plan.yearlyPrice > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold mt-2">Billed annually (${plan.yearlyPrice * 12}/year)</p>
                  )}
                </div>

                <div className="space-y-6 mb-10">
                  {plan.features.map((cat, idx) => (
                    <div key={idx}>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{cat.category}</h4>
                      <ul className="space-y-3">
                        {cat.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Check className={`w-3 h-3 text-${plan.color}-600`} />
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 ${plan.popular
                      ? 'bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:bg-slate-800'
                      : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}>
                  {plan.buttonText}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Compare Features</h2>
            <p className="text-slate-500">A detailed breakdown of everything you get.</p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-6 px-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Feature</th>
                  <th className="py-6 px-4 text-sm font-bold text-slate-900 uppercase tracking-wider text-center">Starter</th>
                  <th className="py-6 px-4 text-sm font-bold text-violet-600 uppercase tracking-wider text-center">Pro</th>
                  <th className="py-6 px-4 text-sm font-bold text-emerald-600 uppercase tracking-wider text-center">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: "Profiles", s: "1 Profile", p: "10 Profiles", b: "Unlimited" },
                  { name: "Templates", s: "Standard", p: "Premium", b: "All + Custom" },
                  { name: "Custom Domain", s: "—", p: "Yes", b: "Yes" },
                  { name: "Early Access", s: "—", p: "Yes", b: "Yes" },
                  { name: "White-label", s: "—", p: "—", b: "Yes" },
                  { name: "API Access", s: "—", p: "—", b: "Yes" },
                  { name: "Support", s: "Community", p: "Priority", b: "24/7 Dedicated" },
                ].map((item, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-6 px-4 font-medium text-slate-700">{item.name}</td>
                    <td className="py-6 px-4 text-center text-slate-500">{item.s}</td>
                    <td className="py-6 px-4 text-center font-semibold text-slate-900">{item.p}</td>
                    <td className="py-6 px-4 text-center font-semibold text-slate-900">{item.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Quick Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-6">
            {[
              { q: "Can I upgrade or downgrade anytime?", a: "Yes, you can change your plan at any time through your account settings. Changes take effect on the next billing cycle." },
              { q: "What is the custom domain feature?", a: "Pro and Business users can map their profile to a custom domain like 'brand.com/profile' for a completely professional look." },
              { q: "Do you offer enterprise pricing?", a: "Absolutely! For organizations requiring more than 100 profiles, please contact our sales team for custom pricing." }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600/20 to-transparent" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Still have questions?</h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">Our team is here to help you find the best solution for your networking needs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <HeroButton variant="primary" size="lg" className="px-10 py-6 text-lg rounded-2xl">
              Get Started for Free
            </HeroButton>
            <HeroButton variant="secondary" size="lg" className="px-10 py-6 text-lg rounded-2xl bg-white/10 text-white border-white/20 hover:bg-white/20">
              Talk to Specialist
            </HeroButton>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-slate-900 mb-6">
            <span className="text-slate-600">P</span>atra
          </div>
          <p className="text-slate-400 text-sm">© 2025 Patra Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
