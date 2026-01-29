import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
    CheckCircleIcon,
    ArrowPathIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const VerifyOTP: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    // Get email from navigation state
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If no email in state, redirect to login as they shouldn't be here directly
            navigate('/login');
        }
    }, [location, navigate]);

    // Handle OTP input change
    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.value && element.nextSibling) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = (e.currentTarget.previousSibling as HTMLInputElement);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus appropriate input
        const nextIndex = Math.min(pastedData.length, 5);
        const inputs = document.querySelectorAll('input[name="otp-digit"]');
        if (inputs[nextIndex]) {
            (inputs[nextIndex] as HTMLInputElement).focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter a complete 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                otp: otpString
            });

            if (response.data.success && response.data.data) {
                const { tokens, user, store } = response.data.data;

                setSuccess(true);

                // Login immediately to set tokens
                const userWithStore = {
                    ...user,
                    storeName: store.name,
                    storeId: store.id,
                };
                login(tokens.accessToken, userWithStore, true);

                // Check specifically for plan passed from Register page
                const plan = location.state?.plan;

                // If user selected a paid plan, redirect to payment
                if (plan && plan !== 'TRIAL') {
                    setError('Redirecting to payment gateway...'); // informative message

                    try {
                        // Create payment order
                        const orderResponse = await api.post('/payments/create-order', {
                            plan: plan,
                            billingCycle: 'monthly' // Default to monthly for now
                        });

                        if (orderResponse.data.success && orderResponse.data.data.paymentUrl) {
                            // Short delay to show success checkmark briefly
                            setTimeout(() => {
                                window.location.href = orderResponse.data.data.paymentUrl;
                            }, 1000);
                            return;
                        }
                    } catch (paymentError) {
                        console.error('Failed to initiate payment', paymentError);
                        // Fallback to dashboard if payment initiation fails, 
                        // user can pay later from settings/upgrade
                    }
                }

                // Default: Auto login after short delay to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed. Please check the OTP.');
        } finally {
            // Keep loading true if we are redirecting to payment to prevent UI flicker
            if (location.state?.plan === 'TRIAL' || !location.state?.plan) {
                setLoading(false);
            }
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/resend-verification', { email });
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-500/20 mb-4">
                            <ShieldCheckIcon className="h-10 w-10 text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                            Verify Your Email
                        </h2>
                        <p className="mt-2 text-sm text-blue-200/70">
                            We've sent a 6-digit code to <br />
                            <span className="font-semibold text-white">{email}</span>
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-6 animate-fade-in">
                            <div className="flex justify-center mb-6">
                                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                    <CheckCircleIcon className="h-10 w-10" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Verified Successfully!</h3>
                            <p className="text-blue-200/70">Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        name="otp-digit"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="one-time-code"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(e.target, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-white/10 bg-white/5 text-white focus:border-blue-500 focus:ring-0 focus:outline-none transition-all duration-200"
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all duration-200"
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Verify Code'}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0 || loading}
                                    className="text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full gap-2"
                                >
                                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    {resendCooldown > 0
                                        ? `Resend code in ${resendCooldown}s`
                                        : 'Resend verification code'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
