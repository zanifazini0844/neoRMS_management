import React, { useState } from 'react';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';

export default function AuthForm({
  type,
  onSubmit,
  loading,
  error,
  submitLabel,
  footer,
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLogin = type === 'login';

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = isLogin
      ? { email, password }
      : { fullName, email, password };

    onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-neutral-800">
            Full Name
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <User size={18} />
            </span>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 rounded-xl border-[#C3110C] focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1"
              placeholder="John Doe"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-neutral-800">
          Email
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
            <Mail size={18} />
          </span>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 rounded-xl border border-[#C3110C] focus-visible:ring-2 focus-visible:ring-[#E6501B] focus-visible:border-[#E6501B] focus-visible:ring-offset-1"
            placeholder="you@example.com"
          />
        </div>
      </div>


      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-neutral-800">
          Password
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
            <Lock size={18} />
          </span>
          <Input
            id="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 rounded-xl border border-[#C3110C] focus-visible:ring-2 focus-visible:ring-[#E6501B] focus-visible:border-[#E6501B] focus-visible:ring-offset-1"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#C3110C] text-white hover:bg-[#E6501B] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{submitLabel}</span>
      </Button>

      {footer ? (
        <div className="pt-2 text-center text-sm text-neutral-500">{footer}</div>
      ) : null}
    </form>
  );
}

