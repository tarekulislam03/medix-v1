import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            navigate('/reset-password', { state: { email } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Glassmorphism card */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl">
                    {!success ? (
                        <>
                            {/* Back to Login */}
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 transition-colors mb-6"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                                Back to login
                            </Link>

                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                        <EnvelopeIcon className="h-7 w-7" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">
                                    Forgot password?
                                </h2>
                                <p className="mt-2 text-blue-200/70">
                                    No worries, we'll send you reset instructions.
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1.5">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-sm animate-shake">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : 'Reset password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center py-6">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30 animate-bounce-slow">
                                    <CheckCircleIcon className="h-9 w-9" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Check your email
                            </h2>
                            <p className="text-blue-200/70 mb-6">
                                We sent a password reset link to<br />
                                <span className="font-semibold text-blue-300">{email}</span>
                            </p>
                            <p className="text-sm text-blue-200/50 mb-6">
                                Didn't receive the email? Check your spam folder, or
                            </p>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail('');
                                }}
                                className="text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors underline underline-offset-4"
                            >
                                Try a different email
                            </button>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
                                >
                                    <ArrowLeftIcon className="w-4 h-4" />
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom tagline */}
                <p className="mt-6 text-center text-xs text-blue-200/40">
                    © {new Date().getFullYear()} MediX POS. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
