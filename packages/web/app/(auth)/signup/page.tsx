'use client';

import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresConfirmation) {
          alert('Please check your email to confirm your account');
        } else {
          alert('Account created successfully! Welcome to TravelAgentic.');
          window.location.href = '/welcome';
        }
      } else {
        if (data.details) {
          // Show validation errors
          const errorMessages = data.details.map((detail: any) => detail.message).join('\n');
          alert(errorMessages);
        } else {
          alert(data.error || 'Sign up failed');
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
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
            'url(https://images.pexels.com/photos/32828093/pexels-photo-32828093.jpeg)',
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
                Join TravelAgentic
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Create your account and start planning unforgettable journeys with our AI-powered travel assistant.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-lg">Personalized travel recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-lg">Smart itinerary planning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-lg">Best deals and booking assistance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-lg">24/7 travel support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="w-full">
            <Card className="bg-white/90 backdrop-blur-sm lg:bg-white/95">
              <CardHeader className="text-center">
                <CardTitle className={`text-2xl lg:text-3xl ${inter.className} font-medium`}>
                  Create your account
                </CardTitle>
                <p className="text-gray-600 lg:text-lg">
                  Join TravelAgentic to start planning your perfect vacation
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="lg:text-base">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="h-11 lg:h-12 lg:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="lg:text-base">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="h-11 lg:h-12 lg:text-base"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="lg:text-base">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
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
                        placeholder="Create a strong password"
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

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="lg:text-base">Confirm password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-11 lg:h-12 lg:text-base pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm lg:text-base leading-5">
                      I agree to the{' '}
                      <Link href="#" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="h-11 lg:h-12 w-full bg-blue-600 hover:bg-blue-700 lg:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>

                  {/* Login Link */}
                  <div className="pt-4 text-center">
                    <p className="text-sm lg:text-base text-gray-600">
                      Already have an account?{' '}
                      <Link
                        href="/login"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Sign in
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
