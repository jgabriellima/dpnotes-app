/**
 * Auth Context
 * 
 * Manages authentication state and provides auth methods
 * Uses Supabase Auth for authentication
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/client';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

// Importante para fechar o browser após OAuth
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAnonymous: boolean;  // Novo: indica se está em modo anônimo
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  continueAnonymous: () => void;  // Novo: continuar sem conta
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);  // Modo anônimo por padrão

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAnonymous(!session);  // Se não tem sessão, está anônimo
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAnonymous(!session);  // Se não tem sessão, está anônimo
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    setIsAnonymous(false);
    
    // Navigate to home after successful login
    router.replace('/(tabs)');
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) throw error;

    setIsAnonymous(false);

    // Navigate to home after successful signup
    router.replace('/(tabs)');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setIsAnonymous(true);  // Volta para modo anônimo
    
    // Navigate to login after signout
    router.replace('/auth/signin');
  };

  const continueAnonymous = () => {
    setIsAnonymous(true);
    setLoading(false);
    router.replace('/(tabs)');
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔵 Iniciando Google OAuth...');
      
      const redirectUrl = Linking.createURL('/auth/callback');
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('Erro ao iniciar OAuth:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('URL de autenticação não retornada pelo Supabase');
      }

      console.log('Abrindo navegador...');
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      console.log('Resultado do navegador:', result);

      if (result.type === 'success') {
        const { url } = result;
        const params = new URL(url).searchParams;
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) throw sessionError;
          
          console.log('✅ Login com Google bem-sucedido!');
          router.replace('/(tabs)');
        }
      } else if (result.type === 'cancel') {
        console.log('Usuário cancelou o login');
        Alert.alert('Login Cancelado', 'Você cancelou o login com Google');
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', error.message || 'Não foi possível fazer login com Google');
      throw error;
    }
  };

  const signInWithTwitter = async () => {
    try {
      console.log('𝕏 Iniciando Twitter/X OAuth...');
      
      const redirectUrl = Linking.createURL('/auth/callback');
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('Erro ao iniciar OAuth:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('URL de autenticação não retornada pelo Supabase');
      }

      console.log('Abrindo navegador...');
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      console.log('Resultado do navegador:', result);

      if (result.type === 'success') {
        const { url } = result;
        const params = new URL(url).searchParams;
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) throw sessionError;
          
          console.log('✅ Login com X/Twitter bem-sucedido!');
          router.replace('/(tabs)');
        }
      } else if (result.type === 'cancel') {
        console.log('Usuário cancelou o login');
        Alert.alert('Login Cancelado', 'Você cancelou o login com X');
      }
    } catch (error: any) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', error.message || 'Não foi possível fazer login com X');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isAnonymous,
      signIn, 
      signUp, 
      signOut,
      signInWithGoogle,
      signInWithTwitter,
      continueAnonymous
    }}>
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

