import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [profileCheck, setProfileCheck] = useState<{
    exists: boolean;
    needsOnboarding: boolean;
  } | null>(null);
  const location = window.location;

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, onboarding_completed')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking profile:', error);
            setProfileCheck({ exists: false, needsOnboarding: false });
            return;
          }

          setProfileCheck({
            exists: !!data,
            needsOnboarding: !data?.onboarding_completed
          });
        } catch (error) {
          console.error('Error in profile check:', error);
          setProfileCheck({ exists: false, needsOnboarding: false });
        }
      }
    };

    checkProfile();
  }, [user]);

  if (loading || (user && profileCheck === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profileCheck?.exists) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if not completed (unless already on onboarding page)
  if (profileCheck.needsOnboarding && !location.pathname.includes('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};