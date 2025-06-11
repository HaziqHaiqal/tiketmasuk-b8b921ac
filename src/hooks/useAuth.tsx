
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  approval_status?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: 'customer' | 'vendor', additionalData?: any) => Promise<void>;
  isVendor: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Send welcome email for new signups
          if (event === 'SIGNED_UP') {
            setTimeout(() => {
              sendWelcomeEmail(session.user.email!);
            }, 1000);
          }
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const sendWelcomeEmail = async (email: string) => {
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          templateType: 'welcome',
          variables: {
            userEmail: email
          }
        }
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      // First get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_name')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        return;
      }

      const role = userRoles?.[0]?.role_name as 'customer' | 'vendor' | 'admin' || 'customer';

      // Get profile data based on role
      let profileData: any = null;
      let approval_status = undefined;

      if (role === 'vendor' || role === 'admin') {
        // Get management profile for vendors/admins
        const { data: mgmtProfile, error: mgmtError } = await supabase
          .from('management_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!mgmtError && mgmtProfile) {
          profileData = {
            id: mgmtProfile.id,
            name: mgmtProfile.business_name,
            email: mgmtProfile.business_name, // Fallback since email not in management_profiles
            role: role,
            approval_status: mgmtProfile.approval_status
          };
        }
      } else {
        // Get customer profile
        const { data: custProfile, error: custError } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!custError && custProfile) {
          profileData = {
            id: custProfile.id,
            name: custProfile.full_name,
            email: custProfile.email,
            role: role
          };
        }
      }

      // Fallback if no profile found
      if (!profileData) {
        profileData = {
          id: userId,
          name: 'User',
          email: 'user@example.com',
          role: role,
          approval_status: approval_status
        };
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Successfully logged out!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'customer' | 'vendor', additionalData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            ...additionalData
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      if (role === 'vendor') {
        toast.success('Registration successful! Your vendor account is pending admin approval.');
      } else {
        toast.success('Registration successful! Please check your email to confirm your account.');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const isVendor = profile?.role === 'vendor';
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      login,
      logout,
      register,
      isVendor,
      isAdmin,
      loading
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
