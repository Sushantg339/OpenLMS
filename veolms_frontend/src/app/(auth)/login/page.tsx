'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LogIn, Sparkles, User, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-slate-800 shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mx-auto flex items-center justify-center text-indigo-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in to access your course portal</p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={loading}
              icon={<LogIn className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Autofill Helpers */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <span className="text-xs font-semibold text-slate-400 block mb-3">Quick Demo Login Presets</span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={() => handleQuickDemo('admin@openlms.io')}
                icon={<Shield className="w-3.5 h-3.5 text-purple-400" />}
                className="text-xs py-2"
              >
                Fill Admin Demo
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => handleQuickDemo('student@openlms.io')}
                icon={<User className="w-3.5 h-3.5 text-indigo-400" />}
                className="text-xs py-2"
              >
                Fill Student Demo
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-indigo-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
