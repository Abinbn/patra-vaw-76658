import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking profile:', error);
            setProfileExists(false);
            return;
          }

          setProfileExists(!!data);
        } catch (error) {
          console.error('Error in profile check:', error);
          setProfileExists(false);
        }
      }
    };

    checkProfile();
  }, [user]);

  if (loading || (user && profileExists === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || profileExists === false) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};