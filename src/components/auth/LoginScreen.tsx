"use client";

import { useState } from 'react';
import { authService } from '@/services/authService';
import Image from 'next/image';

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Login Failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl fade-in">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-layer-group text-3xl text-blue-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Dispatch Manager</h1>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition shadow-sm mt-2 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
              unoptimized
            />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          {error && (
            <p className="text-red-500 text-xs text-center flex items-center justify-center gap-1 mt-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
