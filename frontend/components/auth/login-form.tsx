'use client';

// Login form — collects username/password, calls auth API, stores tokens

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { setAccessToken, setRefreshToken, setUser } from '@/lib/auth-utils';
import type { TokenResponse, User } from '@/types/user';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: obtain JWT tokens
      const { data: tokens } = await axios.post<TokenResponse>(
        `${API_BASE}/auth/login/`,
        { username, password }
      );
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);

      // Step 2: fetch current user profile
      const { data: user } = await axios.get<User>(`${API_BASE}/auth/me/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      setUser(user);

      router.push('/');
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('auth.loginTitle')}</CardTitle>
        <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t('auth.username')}</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading') : t('common.login')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
