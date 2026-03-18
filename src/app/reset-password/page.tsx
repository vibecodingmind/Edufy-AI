'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const [status, setStatus] = useState<'form' | 'loading' | 'success'>('form');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setStatus('loading');
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        toast.success('Password reset successfully!');
      } else {
        toast.error(data.error || 'Failed to reset password');
        setStatus('form');
      }
    } catch (error) {
      toast.error('An error occurred');
      setStatus('form');
    }
  };

  if (!token) {
    return (
      <Card className="border-0 shadow-2xl max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>Invalid Link</CardTitle>
          <CardDescription>This password reset link is invalid or has expired.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => window.location.href = '/'}>Back to Login</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">EDUC.AI</span>
      </div>

      <Card className="border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'success' ? (
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <GraduationCap className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'success' ? 'Password Reset!' : 'Reset Your Password'}
          </CardTitle>
          <CardDescription>
            {status === 'success' 
              ? 'Your password has been reset successfully.' 
              : 'Enter your new password below'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="text-center">
              <Button
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white w-full"
                onClick={() => window.location.href = '/'}
              >
                Continue to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-11"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-md flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 p-4">
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
