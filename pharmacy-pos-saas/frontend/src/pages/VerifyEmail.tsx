import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Keep track of verified tokens to prevent double-execution in StrictMode handling
const verifiedTokens = new Set<string>();

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setError('Invalid verification link');
                setLoading(false);
                return;
            }

            // Prevent double firing (Module-level check persists across remounts)
            if (verifiedTokens.has(token)) {
                // If we already verified this token locally, just show success? 
                // However, we might not have the result yet if it's pending.
                // But for the specific case of preventing the *second* call from firing:
                return;
            }
            verifiedTokens.add(token);

            try {
                const response = await api.get(`/auth/verify-email?token=${token}`);

                if (response.data.success && response.data.data) {
                    const { tokens, user, store } = response.data.data;

                    // Auto-login the user with the tokens
                    const userWithStore = {
                        ...user,
                        storeName: store.name,
                        storeId: store.id,
                    };

                    // Login with remember me = true (since they verified email)
                    login(tokens.accessToken, userWithStore, true);
                    setSuccess(true);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Email verification failed');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token, login]);

    // Countdown and auto-redirect after verification success
    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (success && countdown === 0) {
            navigate('/dashboard');
        }
    }, [success, countdown, navigate]);

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
                    {loading ? (
                        /* Loading State */
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Verifying your email...
                            </h2>
                            <p className="text-blue-200/70">
                                Please wait while we verify your email address.
                            </p>
                        </div>
                    ) : success ? (
                        /* Success State */
                        <div className="text-center py-6">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30 animate-bounce-slow">
                                    <CheckCircleIcon className="h-9 w-9" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Email verified!
                            </h2>
                            <p className="text-blue-200/70 mb-4">
                                Your email has been successfully verified.<br />
                                You match our records!
                            </p>
                            <p className="text-sm text-blue-300 font-medium mb-8 bg-blue-500/10 py-2 px-4 rounded-lg inline-block">
                                Redirecting to dashboard in {countdown} seconds...
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    ) : (
                        /* Error State */
                        <div className="text-center py-6">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                                    <XCircleIcon className="h-9 w-9" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Verification failed
                            </h2>
                            <p className="text-blue-200/70 mb-8">
                                {error}
                            </p>

                            <div className="space-y-4">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                >
                                    Go to login
                                </Link>

                                <p className="text-sm text-blue-200/50">
                                    Need a new verification email?
                                </p>
                                <ResendVerificationForm />
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

// Resend Verification Form Component
const ResendVerificationForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/resend-verification', { email });
            setSent(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend verification email');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-sm">
                <EnvelopeIcon className="h-5 w-5 inline mr-2" />
                Verification email sent!
            </div>
        );
    }

    return (
        <form onSubmit={handleResend} className="space-y-3">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-2.5 px-4 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 text-sm"
            />
            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 transition-all duration-200"
            >
                {loading ? 'Sending...' : 'Resend verification email'}
            </button>
        </form>
    );
};

export default VerifyEmail;
