import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { CheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const plans = [
    {
        id: 'TRIAL',
        name: 'Free Trial',
        price: '₹0',
        period: '7 days',
        features: ['Single User', 'Basic Inventory', '100 Bills/day', 'Email Support'],
        recommended: false,
    },
    {
        id: 'BASIC',
        name: 'Basic',
        price: '₹499',
        period: '/month',
        features: ['User Management', 'Inventory Management', 'Unlimited Billing', 'Analytics', 'Email Support'],
        recommended: false,
    },
    {
        id: 'STANDARD',
        name: 'Standard',
        price: '₹999',
        period: '/month',
        features: ['Multi-User (5)', 'Advanced Inventory', 'GST Reports', 'Customer Loyalty', 'Priority Support'],
        recommended: true,
    },
    {
        id: 'ADVANCED',
        name: 'Advanced',
        price: '₹1999',
        period: '/month',
        features: ['Unlimited Users', 'Multi-Store Support', 'API Access', 'Dedicated Account Manager', '24/7 Phone Support'],
        recommended: false,
    },
];

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'plan' | 'form'>('plan');
    const [selectedPlan, setSelectedPlan] = useState<string>('TRIAL');
    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
        setStep('form');
        window.scrollTo(0, 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;
            const payload = { ...registerData, plan: selectedPlan };

            const response = await api.post('/auth/register', payload);

            if (response.data.success) {
                // Redirect to OTP verification page
                navigate('/verify-otp', {
                    state: {
                        email: formData.email,
                        plan: selectedPlan
                    }
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/30">
                            M
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                        MediX <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">POS</span>
                    </h1>
                    <p className="max-w-xl mx-auto mt-4 text-xl text-blue-200/70">
                        The complete pharmacy management solution.
                    </p>
                </div>

                {step === 'plan' && (
                    <div className="space-y-12">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Choose the right plan for your pharmacy
                            </h2>
                            <p className="max-w-2xl mx-auto mt-3 text-xl text-blue-200/70 sm:mt-4">
                                Start with a 7-day free trial. No credit card required.
                            </p>
                        </div>

                        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-4 lg:gap-8">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-2xl backdrop-blur-xl bg-white/10 border divide-y divide-white/10 flex flex-col transform hover:scale-105 transition-all duration-300 ${plan.recommended
                                        ? 'border-blue-400/50 shadow-xl shadow-blue-500/20'
                                        : 'border-white/20 hover:border-white/40'
                                        }`}
                                >
                                    {plan.recommended && (
                                        <span className="absolute top-0 transform -translate-y-1/2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase shadow-lg">
                                            Recommended
                                        </span>
                                    )}
                                    <div className="p-6">
                                        <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
                                        <p className="mt-4">
                                            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                            <span className="text-base font-medium text-blue-200/70">{plan.period}</span>
                                        </p>
                                        <button
                                            onClick={() => handlePlanSelect(plan.id)}
                                            className={`mt-8 block w-full py-3 px-6 rounded-xl text-center font-medium text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${plan.recommended
                                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-cyan-600'
                                                : 'bg-white/10 hover:bg-white/20 border border-white/20'
                                                }`}
                                        >
                                            {plan.id === 'TRIAL' ? 'Start Free Trial' : `Select ${plan.name}`}
                                        </button>
                                    </div>
                                    <div className="pt-6 pb-8 px-6 flex-1">
                                        <h3 className="text-xs font-semibold text-blue-200 tracking-wide uppercase">What's included</h3>
                                        <ul className="mt-6 space-y-4">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex space-x-3">
                                                    <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-400" aria-hidden="true" />
                                                    <span className="text-sm text-blue-100/80">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-base text-blue-200/70">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-blue-300 hover:text-blue-200 transition-colors">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {step === 'form' && (
                    <div className="max-w-md mx-auto">
                        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="py-8 px-6 sm:px-10">
                                <div className="mb-6">
                                    <button
                                        onClick={() => setStep('plan')}
                                        className="text-sm text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back to Plans
                                    </button>
                                    <h2 className="mt-4 text-3xl font-extrabold text-white text-center">Setup your account</h2>
                                    <p className="text-center text-sm text-blue-200/70 mt-2">
                                        Selected Plan: <span className="font-semibold text-blue-300">{plans.find(p => p.id === selectedPlan)?.name}</span>
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-sm animate-shake">
                                        {error}
                                    </div>
                                )}

                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    {/* Store Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-blue-100 mb-1.5">Store Name</label>
                                        <input
                                            type="text"
                                            name="storeName"
                                            required
                                            value={formData.storeName}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm"
                                            placeholder="Your Pharmacy Name"
                                        />
                                    </div>

                                    {/* Owner Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-blue-100 mb-1.5">Owner Name</label>
                                        <input
                                            type="text"
                                            name="ownerName"
                                            required
                                            value={formData.ownerName}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-blue-100 mb-1.5">Email address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm"
                                            placeholder="you@pharmacy.com"
                                        />
                                    </div>

                                    {/* Password with Eye Toggle */}
                                    <div>
                                        <label className="block text-sm font-medium text-blue-100 mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength={8}
                                                className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 pr-12 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-200/70 hover:text-white transition-colors"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-blue-200/50">Must be at least 8 characters</p>
                                    </div>

                                    {/* Confirm Password with Eye Toggle */}
                                    <div>
                                        <label className="block text-sm font-medium text-blue-100 mb-1.5">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                minLength={8}
                                                className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 pr-12 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-200/70 hover:text-white transition-colors"
                                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating account...
                                            </span>
                                        ) : 'Create Account'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom tagline */}
            <p className="mt-12 text-center text-xs text-blue-200/40">
                © {new Date().getFullYear()} MediX POS. All rights reserved.
            </p>
        </div>
    );
};

export default Register;
