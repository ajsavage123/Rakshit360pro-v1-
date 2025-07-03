
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthTest() {
  const { user, signUp, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await signUp(email, password);
      if (result.error) {
        setMessage(`Registration failed: ${result.error.message}`);
      } else {
        setMessage('Registration successful! Check your email for confirmation.');
      }
    } catch (error) {
      setMessage(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setMessage(`Login failed: ${result.error.message}`);
      } else {
        setMessage('Login successful!');
      }
    } catch (error) {
      setMessage(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setMessage('Signed out successfully');
    } catch (error) {
      setMessage(`Sign out error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>You are logged in as {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <Button onClick={handleSignOut} disabled={loading} className="w-full">
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
        <CardDescription>Test Supabase authentication</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
            <Button type="button" onClick={handleSignIn} disabled={loading} variant="outline" className="flex-1">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
          
          {message && (
            <Alert className={message.includes('successful') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
