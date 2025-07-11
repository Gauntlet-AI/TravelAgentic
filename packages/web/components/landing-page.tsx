'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, Plane, MapPin, Calendar, Users, Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth/auth-context';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { supabase } from '@/lib/supabase/client';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export function LandingPage() {
  const { user, loading } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'signup' | 'login'>('signup');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Background slideshow images (same as travel input form)
  const backgroundImages = [
    {
      url: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg',
      alt: 'Tropical Beach Paradise',
    },
    {
      url: 'https://images.pexels.com/photos/32867262/pexels-photo-32867262.jpeg',
      alt: 'Mountain Landscape',
    },
    {
      url: 'https://images.pexels.com/photos/32828093/pexels-photo-32828093.jpeg',
      alt: 'European City',
    },
    {
      url: 'https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg',
      alt: 'Japanese Temple',
    },
    {
      url: 'https://images.pexels.com/photos/20179685/pexels-photo-20179685.jpeg',
      alt: 'African Safari',
    },
    {
      url: 'https://images.pexels.com/photos/360912/pexels-photo-360912.jpeg',
      alt: 'Northern Lights',
    },
  ];

  // Redirect authenticated users to welcome page
  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/welcome';
    }
  }, [user, loading]);

  // Slideshow effect with proper crossfade
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 15000); // Change image every 15 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Reset form when mode changes
  useEffect(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    });
    setErrors({});
    setSuccessMessage('');
  }, [formMode]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (formMode === 'signup') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formMode === 'signup' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      if (formMode === 'signup') {
        // Use client-side signup
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            },
          },
        });

        if (error) {
          setErrors({ general: error.message });
        } else if (!data.session) {
          setSuccessMessage('Please check your email to confirm your account.');
        } else {
          // Create user profile after successful signup
          if (data.user) {
            await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                avatar_url: data.user.user_metadata?.avatar_url || null,
                updated_at: new Date().toISOString(),
              });
          }
          setSuccessMessage('Account created successfully!');
          // The auth context will handle the redirect
        }
      } else {
        // Use client-side signin
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setErrors({ general: error.message });
        } else {
          // Update user profile after successful signin
          if (data.user) {
            await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || null,
                avatar_url: data.user.user_metadata?.avatar_url || null,
                updated_at: new Date().toISOString(),
              });
          }
          setSuccessMessage('Signed in successfully!');
          // The auth context will handle the redirect
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetStarted = () => {
    setFormMode('signup');
    setShowForm(true);
  };

  const handleSignIn = () => {
    setFormMode('login');
    setShowForm(true);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => {
          const isActive = index === currentImageIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image.url})`,
              }}
            />
          );
        })}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <span
            className={`text-2xl font-bold text-white drop-shadow-lg ${inter.className} font-medium`}
          >
            TravelAgentic
          </span>
        </div>
        
        {user && <UserProfileDropdown />}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Section */}
            <div className="text-center lg:text-left text-white">
              <h1 className={`text-5xl lg:text-6xl font-bold mb-6 ${inter.className} font-medium`}>
                Your AI Travel
                <br />
                <span className="text-blue-400">Assistant</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed">
                Discover amazing destinations, plan perfect itineraries, and book your dream vacation with the power of AI.
              </p>
              
              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-lg">AI-powered travel recommendations</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-lg">Smart itinerary planning</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-lg">Best deals and booking assistance</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-lg">24/7 travel support</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 text-lg"
                  onClick={handleGetStarted}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="!text-white border-white hover:bg-white/10 backdrop-blur-sm font-medium px-8 py-4 text-lg !bg-transparent hover:!text-white"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              </div>
            </div>

            {/* Right Side Content */}
            {!user && showForm ? (
              /* Auth Forms - Show when user clicks Get Started or Sign In */
              <div className="w-full max-w-md mx-auto transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-right-4">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white transition-all duration-300 ease-in-out">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-white transition-all duration-300 ease-in-out">
                      {formMode === 'signup' ? 'Create your account' : 'Welcome back'}
                    </CardTitle>
                    <p className="text-white/90 mt-2 transition-all duration-300 ease-in-out">
                      {formMode === 'signup' 
                        ? 'Join TravelAgentic to start planning your perfect vacation'
                        : 'Sign in to your TravelAgentic account'
                      }
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="transition-all duration-300 ease-in-out">
                        {formMode === 'signup' && (
                          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                              <Label htmlFor="firstName" className="text-white">
                                First name
                              </Label>
                              <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 transition-all duration-200 ease-in-out"
                                placeholder="John"
                                disabled={isSubmitting}
                              />
                              {errors.firstName && (
                                <p className="text-red-300 text-sm mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.firstName}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="lastName" className="text-white">
                                Last name
                              </Label>
                              <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 transition-all duration-200 ease-in-out"
                                placeholder="Doe"
                                disabled={isSubmitting}
                              />
                              {errors.lastName && (
                                <p className="text-red-300 text-sm mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.lastName}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="email" className="text-white">
                          Email address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 transition-all duration-200 ease-in-out"
                          placeholder="john@example.com"
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="text-red-300 text-sm mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.email}</p>
                        )}
                      </div>

                      <div className="transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="password" className="text-white">
                          Password
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 transition-all duration-200 ease-in-out"
                            placeholder={formMode === 'signup' ? "Create a strong password" : "Enter your password"}
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-300 text-sm mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.password}</p>
                        )}
                      </div>

                      <div className="transition-all duration-300 ease-in-out">
                        {formMode === 'signup' && (
                          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="confirmPassword" className="text-white">
                              Confirm password
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 transition-all duration-200 ease-in-out"
                                placeholder="Confirm your password"
                                disabled={isSubmitting}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="text-red-300 text-sm mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.confirmPassword}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="transition-all duration-300 ease-in-out">
                        {formMode === 'signup' && (
                          <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Checkbox
                              id="acceptTerms"
                              checked={formData.acceptTerms}
                              onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                              className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/50 transition-all duration-200"
                              disabled={isSubmitting}
                            />
                            <Label htmlFor="acceptTerms" className="text-sm text-white/90">
                              I agree to the{' '}
                              <Link href="/terms" className="text-blue-300 hover:text-blue-200 transition-colors duration-200">
                                Terms of Service
                              </Link>
                              {' '}and{' '}
                              <Link href="/privacy" className="text-blue-300 hover:text-blue-200 transition-colors duration-200">
                                Privacy Policy
                              </Link>
                            </Label>
                          </div>
                        )}
                      </div>

                      {formMode === 'login' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-white/80 text-sm text-center">
                            Welcome back! Please sign in to your account.
                          </p>
                        </div>
                      )}

                      {errors.acceptTerms && (
                        <p className="text-red-300 text-sm animate-in fade-in slide-in-from-top-1 duration-200">{errors.acceptTerms}</p>
                      )}

                      {errors.general && (
                        <p className="text-red-300 text-sm animate-in fade-in slide-in-from-top-1 duration-200">{errors.general}</p>
                      )}

                      {successMessage && (
                        <p className="text-green-300 text-sm animate-in fade-in slide-in-from-top-1 duration-200">{successMessage}</p>
                      )}

                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {formMode === 'signup' ? 'Creating account...' : 'Signing in...'}
                            </>
                          ) : (
                            formMode === 'signup' ? 'Create account' : 'Sign in'
                          )}
                        </Button>
                      </div>
                    </form>

                    <div className="mt-6 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-white/90">
                        {formMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                        {' '}
                        <button
                          onClick={() => setFormMode(formMode === 'signup' ? 'login' : 'signup')}
                          className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200"
                        >
                          {formMode === 'signup' ? 'Sign in' : 'Sign up'}
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Feature Cards - Show by default when user is not authenticated and hasn't clicked buttons */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-500 ease-in-out">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white transition-all duration-200 ease-in-out hover:bg-white/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      Smart Destinations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/90">
                      Discover hidden gems and popular attractions tailored to your preferences.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white transition-all duration-200 ease-in-out hover:bg-white/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      Perfect Timing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/90">
                      Get the best travel dates, weather insights, and seasonal recommendations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white transition-all duration-200 ease-in-out hover:bg-white/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-blue-400" />
                      Seamless Booking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/90">
                      Book flights, hotels, and activities all in one place with competitive prices.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white transition-all duration-200 ease-in-out hover:bg-white/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      AI-Powered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/90">
                      Advanced AI learns your preferences to create personalized travel experiences.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 