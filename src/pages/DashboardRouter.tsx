import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dashboard } from './Dashboard';
import { CompanyDashboard } from './CompanyDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchAccountType = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setAccountType(data?.account_type || 'individual');
      } catch (error) {
        console.error('Error fetching account type:', error);
        setAccountType('individual');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountType();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return accountType === 'company' ? <CompanyDashboard /> : <Dashboard />;
};
