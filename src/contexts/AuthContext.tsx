import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track device info helper
    const trackDeviceInfo = async (userId: string) => {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      };

      // Update profile with device info
      await supabase
        .from('profiles')
        .update({ device_info: deviceInfo })
        .eq('user_id', userId);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Track device info on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          trackDeviceInfo(session.user.id);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        trackDeviceInfo(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Generate random username - ALWAYS create one
      const generateUsername = async (): Promise<string> => {
        // Start with a base from name or email
        let base = fullName 
          ? fullName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') 
          : email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // If base is empty, use 'user'
        if (!base || base.length === 0) {
          base = 'user';
        }
        
        // Always add random 4-digit number to ensure uniqueness
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        let username = `${base}${randomNum}`;
        
        // Double-check for collisions (very rare with 4-digit random)
        const { data: existingCard } = await supabase
          .from('digital_cards')
          .select('vanity_url')
          .eq('vanity_url', username)
          .maybeSingle();
        
        // If still exists (extremely rare), add more random digits
        if (existingCard) {
          username = `${base}${randomNum}${Math.floor(Math.random() * 99)}`;
        }
        
        return username;
      };
      
      const username = await generateUsername();
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            username: username
          }
        }
      });
      
      // Create digital card with vanity_url immediately
      if (data.user && !error) {
        await supabase.from('digital_cards').insert({
          owner_user_id: data.user.id,
          title: fullName || email.split('@')[0] || 'My Card',
          vanity_url: username,
          content_json: {}
        });
      }
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};