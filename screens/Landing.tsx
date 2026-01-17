
import React, { useState } from 'react';
import { signIn, signUp, demoLogin } from '../services/authService';

interface LandingProps {
    onLoginSuccess: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('請填寫所有欄位');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await signIn(email, password);

        if (result.success) {
            onLoginSuccess();
        } else {
            setError(result.error || '登入失敗');
        }

        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name) {
            setError('請填寫所有欄位');
            return;
        }

        if (password.length < 6) {
            setError('密碼至少需要 6 個字元');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await signUp(email, password, name);

        if (result.success) {
            onLoginSuccess();
        } else {
            setError(result.error || '註冊失敗');
        }

        setIsLoading(false);
    };

    const handleDemoLogin = async () => {
        setIsLoading(true);
        setError('');
        const result = await demoLogin();
        if (result.success) {
            onLoginSuccess();
        } else {
            setError(result.error || '訪客模式啟動失敗');
        }
        setIsLoading(false);
    };

    // Welcome Screen
    if (mode === 'welcome') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#fcfaf8] via-[#fff5eb] to-[#ffe8d6] dark:from-[#221810] dark:via-[#2d1f14] dark:to-[#1a1310] flex flex-col">
                {/* Hero Section */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                    {/* Logo/Icon */}
                    <div className="mb-6 relative">
                        <div className="w-28 h-28 bg-gradient-to-br from-primary to-[#f5a623] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/30">
                            <span className="material-symbols-outlined text-white text-6xl">pets</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-primary text-xl">favorite</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-[#1b130d] dark:text-white mb-3 tracking-tight">
                        Paws Haven
                    </h1>
                    <p className="text-primary font-bold text-lg mb-4">寵物領養平台</p>
                    <p className="text-[#9a6c4c] dark:text-zinc-400 text-base max-w-xs leading-relaxed mb-8">
                        為每一位毛孩找到溫暖的家，讓愛延續，讓生命綻放。
                    </p>

                    {/* Features */}
                    <div className="flex gap-6 mb-12">
                        <FeatureItem icon="search" label="探索" />
                        <FeatureItem icon="favorite" label="收藏" />
                        <FeatureItem icon="chat" label="諮詢" />
                        <FeatureItem icon="verified" label="領養" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-8 pb-12 space-y-4">
                    <button
                        onClick={() => setMode('login')}
                        className="w-full h-[60px] bg-primary hover:bg-[#e06b1a] text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">login</span>
                        登入帳號
                    </button>

                    <button
                        onClick={() => setMode('register')}
                        className="w-full h-[60px] bg-white dark:bg-zinc-800 text-[#1b130d] dark:text-white font-bold text-lg rounded-2xl transition-all shadow-lg border border-primary/10 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        註冊新帳號
                    </button>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[#e7d9cf] dark:bg-zinc-700"></div>
                        <span className="text-[#9a6c4c] dark:text-zinc-500 text-sm font-medium">或</span>
                        <div className="flex-1 h-px bg-[#e7d9cf] dark:bg-zinc-700"></div>
                    </div>

                    <button
                        onClick={handleDemoLogin}
                        className="w-full h-[52px] bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">explore</span>
                        快速體驗 (訪客模式)
                    </button>
                </div>
            </div>
        );
    }

    // Login Screen
    if (mode === 'login') {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                {/* Header */}
                <div className="flex items-center p-4">
                    <button
                        onClick={() => { setMode('welcome'); setError(''); }}
                        className="flex size-12 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                    </button>
                </div>

                <div className="flex-1 px-8 pt-4">
                    {/* Title */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-[#1b130d] dark:text-white mb-2">歡迎回來 👋</h2>
                        <p className="text-[#9a6c4c] dark:text-zinc-400">登入您的帳號以繼續使用</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1b130d] dark:text-zinc-300 ml-1">電子郵件</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-14 px-5 rounded-2xl border border-[#e7d9cf] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#1b130d] dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1b130d] dark:text-zinc-300 ml-1">密碼</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-14 px-5 rounded-2xl border border-[#e7d9cf] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#1b130d] dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-500">error</span>
                                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[60px] bg-primary hover:bg-[#e06b1a] disabled:bg-gray-300 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    登入中...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">login</span>
                                    登入
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[#9a6c4c] dark:text-zinc-500 mt-8">
                        還沒有帳號？{' '}
                        <button
                            onClick={() => { setMode('register'); setError(''); }}
                            className="text-primary font-bold hover:underline"
                        >
                            立即註冊
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    // Register Screen
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4">
                <button
                    onClick={() => { setMode('welcome'); setError(''); }}
                    className="flex size-12 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </button>
            </div>

            <div className="flex-1 px-8 pt-4">
                {/* Title */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-[#1b130d] dark:text-white mb-2">建立帳號 🐾</h2>
                    <p className="text-[#9a6c4c] dark:text-zinc-400">加入我們，開始您的領養之旅</p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1b130d] dark:text-zinc-300 ml-1">您的姓名</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-14 px-5 rounded-2xl border border-[#e7d9cf] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#1b130d] dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="王小明"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1b130d] dark:text-zinc-300 ml-1">電子郵件</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-14 px-5 rounded-2xl border border-[#e7d9cf] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#1b130d] dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1b130d] dark:text-zinc-300 ml-1">密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 px-5 rounded-2xl border border-[#e7d9cf] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#1b130d] dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="至少 6 個字元"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[60px] bg-primary hover:bg-[#e06b1a] disabled:bg-gray-300 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                註冊中...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">person_add</span>
                                註冊
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-[#9a6c4c] dark:text-zinc-500 mt-8">
                    已有帳號？{' '}
                    <button
                        onClick={() => { setMode('login'); setError(''); }}
                        className="text-primary font-bold hover:underline"
                    >
                        立即登入
                    </button>
                </p>
            </div>
        </div>
    );
};

const FeatureItem: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
            <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
        </div>
        <span className="text-xs font-bold text-[#9a6c4c] dark:text-zinc-400">{label}</span>
    </div>
);

export default Landing;
