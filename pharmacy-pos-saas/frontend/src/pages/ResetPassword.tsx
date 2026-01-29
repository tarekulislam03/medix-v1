import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '@/services/api';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, ArrowLeftIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', { email, otp, password });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        if (!password) return { level: 0, text: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        const levels = [
            { level: 1, text: 'Weak', color: 'bg-red-500' },
            { level: 2, text: 'Fair', color: 'bg-orange-500' },
            { level: 3, text: 'Good', color: 'bg-yellow-500' },
            { level: 4, text: 'Strong', color: 'bg-green-500' },
        ];

        return levels[strength - 1] || { level: 0, text: '', color: '' };
    };

    const passwordStrength = getPasswordStrength();

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
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                        <LockClosedIcon className="h-7 w-7" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">
                                    Reset Password
                                </h2>
                                <p className="mt-2 text-blue-200/70">
                                    Enter the OTP sent to your email and your new password.
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 pl-11 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm"
                                            placeholder="you@example.com"
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-200/50">
                                            <EnvelopeIcon className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>

                                {/* OTP Input */}
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-blue-100 mb-1.5">
                                        OTP Code
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            autoComplete="one-time-code"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 pl-11 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm tracking-widest font-mono"
                                            placeholder="123456"
                                            maxLength={6}
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-200/50">
                                            <KeyIcon className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            minLength={8}
                                            className="block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 pr-12 text-white placeholder:text-blue-200/50 ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200 sm:text-sm"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-200/70 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password strength indicator */}
                                    {password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1, 2, 3, 4].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.level
                                                            ? passwordStrength.color
                                                            : 'bg-white/20'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs ${passwordStrength.level <= 1 ? 'text-red-400' :
                                                passwordStrength.level === 2 ? 'text-orange-400' :
                                                    passwordStrength.level === 3 ? 'text-yellow-400' :
                                                        'text-green-400'
                                                }`}>
                                                {passwordStrength.text}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100 mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            minLength={8}
                                            className={`block w-full rounded-lg border-0 bg-white/10 backdrop-blur py-3 px-4 pr-12 text-white placeholder:text-blue-200/50 ring-1 ring-inset transition-all duration-200 sm:text-sm ${confirmPassword && password !== confirmPassword
                                                ? 'ring-red-400/50 focus:ring-red-400'
                                                : confirmPassword && password === confirmPassword
                                                    ? 'ring-green-400/50 focus:ring-green-400'
                                                    : 'ring-white/20 focus:ring-blue-400'
                                                }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-200/70 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="mt-1 text-xs text-red-400">Passwords don't match</p>
                                    )}
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
                                    disabled={loading || password !== confirmPassword}
                                    className="relative w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Resetting...
                                        </span>
                                    ) : 'Reset password'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
                                >
                                    <ArrowLeftIcon className="w-4 h-4" />
                                    Back to login
                                </Link>
                            </div>
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
                                Password reset successful!
                            </h2>
                            <p className="text-blue-200/70 mb-8">
                                Your password has been successfully reset.<br />
                                You can now log in with your new password.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                Continue to login
                            </button>
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

export default ResetPassword;
