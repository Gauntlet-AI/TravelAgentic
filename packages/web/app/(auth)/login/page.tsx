'use client';

import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to dashboard or home page
        window.location.href = '/';
      } else {
        alert(data.error || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg)',
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute left-6 top-6 z-20 flex items-center gap-2 text-white transition-colors hover:text-gray-200"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      {/* Logo */}
      <div className="absolute right-6 top-6 z-20">
        <span
          className={`text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
        >
          TravelAgentic
        </span>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="relative z-10 w-full max-w-md lg:max-w-6xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Welcome Section - Desktop Only */}
          <div className="hidden lg:block text-white">
            <div className="max-w-lg">
              <h1 className={`text-5xl font-bold mb-6 ${inter.className} font-medium`}>
                Welcome back to TravelAgentic
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Sign in to continue planning your perfect vacation with our AI-powered travel assistant.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-lg">AI-powered travel recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-lg">Personalized itineraries</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-lg">Smart booking assistance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="w-full">
            <Card className="bg-white/90 backdrop-blur-sm lg:bg-white/95">
              <CardHeader className="text-center">
                <CardTitle className={`text-2xl lg:text-3xl ${inter.className} font-medium`}>
                  Welcome back
                </CardTitle>
                <p className="text-gray-600 lg:text-lg">Sign in to your account to continue</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="lg:text-base">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 lg:h-12 lg:text-base"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="lg:text-base">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 lg:h-12 lg:text-base pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <Link href="#" className="text-sm lg:text-base text-blue-600 hover:underline">
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="h-11 lg:h-12 w-full bg-blue-600 hover:bg-blue-700 lg:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>

                  {/* Sign Up Link */}
                  <div className="pt-4 text-center">
                    <p className="text-sm lg:text-base text-gray-600">
                      Don't have an account?{' '}
                      <Link
                        href="/signup"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
