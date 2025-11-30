import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Parent, Child } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  parent: Parent | null;
  activeChild: Child | null;
  children: Child[];
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setActiveChild: (child: Child) => void;
  refreshChildren: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadParentData(session.user.id);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadParentData(session.user.id);
        } else {
          setParent(null);
          setActiveChildState(null);
          setChildrenList([]);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadParentData = async (userId: string) => {
    const { data: parentData } = await supabase
      .from('parents')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (parentData) {
      setParent(parentData);
      await loadChildren(userId);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const { data: newParent, error } = await supabase
          .from('parents')
          .insert({
            id: userId,
            name: name,
            email: user.email || '',
          })
          .select()
          .single();

        if (!error && newParent) {
          setParent(newParent);
          try {
            const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`;
            await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'INSERT',
                table: 'parents',
                record: {
                  id: userId,
                  email: user.email || '',
                  created_at: new Date().toISOString(),
                },
                schema: 'public',
              }),
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        }
      }
    }
  };

  const loadChildren = async (parentId: string) => {
    const { data: childrenData } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (childrenData && childrenData.length > 0) {
      setChildrenList(childrenData);
      const stored = localStorage.getItem('activeChildId');
      const active = stored
        ? childrenData.find(c => c.id === stored) || childrenData[0]
        : childrenData[0];
      setActiveChildState(active);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    const { error: profileError } = await supabase
      .from('parents')
      .insert({
        id: data.user.id,
        name,
        email,
      });

    if (profileError) throw profileError;

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'INSERT',
          table: 'parents',
          record: {
            id: data.user.id,
            email: email,
            created_at: new Date().toISOString(),
          },
          schema: 'public',
        }),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const setActiveChild = (child: Child) => {
    setActiveChildState(child);
    localStorage.setItem('activeChildId', child.id);
  };

  const refreshChildren = async () => {
    if (user) {
      await loadChildren(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        parent,
        activeChild,
        children: childrenList,
        loading,
        signUp,
        signIn,
        signOut,
        setActiveChild,
        refreshChildren,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
