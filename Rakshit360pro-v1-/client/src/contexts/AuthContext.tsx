
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        let errorMessage = 'Login failed. ';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'The email or password you entered is incorrect. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please register first.';
        } else {
          errorMessage = 'Unable to sign in. Please try again or contact support if the problem persists.';
        }
        
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });
      
      if (error) {
        let errorMessage = 'Registration failed. ';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Signup requires a valid password')) {
          errorMessage = 'Please enter a valid password with at least 6 characters.';
        } else {
          errorMessage = 'Unable to create account. Please try again or contact support if the problem persists.';
        }
        
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        let errorMessage = 'Password reset failed. ';
        
        if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address.';
        } else {
          errorMessage = 'Unable to send password reset email. Please try again.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { data: null, error: { message: 'Please enter both email and password.' } };
      }

      if (password.length < 6) {
        return { data: null, error: { message: 'Password must be at least 6 characters long.' } };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Supabase signUp error:', error);
        let errorMessage = 'Registration failed. ';
        
        if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Signup requires a valid password')) {
          errorMessage = 'Please enter a valid password with at least 6 characters.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password format. Please try again.';
        } else {
          errorMessage = `Registration failed: ${error.message}`;
        }
        
        return { data: null, error: { message: errorMessage } };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('signUp catch error:', err);
      return { data: null, error: { message: 'Unable to create account. Please check your internet connection and try again.' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { data: null, error: { message: 'Please enter both email and password.' } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        console.error('Supabase signIn error:', error);
        let errorMessage = 'Login failed. ';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'The email or password you entered is incorrect. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please register first.';
        } else {
          errorMessage = `Login failed: ${error.message}`;
        }
        
        return { data: null, error: { message: errorMessage } };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('signIn catch error:', err);
      return { data: null, error: { message: 'Unable to sign in. Please check your internet connection and try again.' } };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Unable to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      login,
      register,
      resetPassword,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
