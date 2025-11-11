/**
 * Sign In Screen - dpnotes.ai
 * 
 * 100% fidelidade ao design de referência
 * Reference: docs/UX_UI_REFERENCES/signin/code.html
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image, KeyboardAvoidingView, Platform, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Icon } from '../../src/components/ui/Icon';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithTwitter, continueAnonymous } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation handled by AuthContext
    } catch (error: any) {
      Alert.alert('Erro no Login', error.message || 'Não foi possível fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    // Errors are handled inside signInWithGoogle
  };

  const handleTwitterSignIn = async () => {
    await signInWithTwitter();
    // Errors are handled inside signInWithTwitter
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-primary-lightest"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
      <ScrollView 
        contentContainerClassName="flex-grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 flex-col items-center justify-center p-6">
          {/* Logo and Title */}
          <View className="flex flex-col items-center gap-2 mb-10">
            <View className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Icon name="edit_square" size={36} color="#ffffff" />
            </View>
            <Text className="text-3xl font-bold text-text-primary tracking-tight">
              dpnotes.ai
            </Text>
            <Text className="text-text-secondary">
              Welcome back! Please login.
            </Text>
          </View>

          {/* Form Container */}
          <View className="w-full max-w-sm">
            {/* Social Login Buttons */}
            <View className="flex flex-col gap-4">
              <Pressable 
                className="flex w-full flex-row items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 px-4 shadow-sm active:bg-gray-50"
                onPress={handleGoogleSignIn}
              >
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA' }}
                  className="h-6 w-6"
                />
                <Text className="text-base font-medium text-text-primary">
                  Continue with Google
                </Text>
              </Pressable>

              <Pressable 
                className="flex w-full flex-row items-center justify-center gap-3 rounded-xl border border-gray-200 bg-black py-3 px-4 shadow-sm active:opacity-90"
                onPress={handleTwitterSignIn}
              >
                <Text className="text-white text-xl font-bold">𝕏</Text>
                <Text className="text-base font-medium text-white">
                  Continue with X
                </Text>
              </Pressable>
            </View>

            {/* OR Divider */}
            <View className="my-6 flex flex-row items-center">
              <View className="flex-grow border-t border-gray-200" />
              <Text className="mx-4 text-sm text-text-secondary">OR</Text>
              <View className="flex-grow border-t border-gray-200" />
            </View>

            {/* Login Form */}
            <View className="flex flex-col gap-4">
              {/* Email Input */}
              <View className="flex flex-col gap-1.5">
                <Text className="text-sm font-medium text-text-secondary">
                  Email or Username
                </Text>
                <TextInput
                  className="w-full rounded-lg border-0 bg-white py-3 px-4 text-text-primary text-base"
                  placeholder="Enter your email or username"
                  placeholderTextColor="#6C6F7D"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* Password Input */}
              <View className="flex flex-col gap-1.5">
                <Text className="text-sm font-medium text-text-secondary">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full rounded-lg border-0 bg-white py-3 pl-4 pr-10 text-text-primary text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="#6C6F7D"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                  <Pressable
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon 
                      name={showPassword ? 'info' : 'lock'} 
                      size={20} 
                      color="#6C6F7D" 
                    />
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password */}
              <View className="flex flex-row justify-end">
                <Pressable onPress={() => alert('Password reset coming soon')}>
                  <Text className="text-sm font-medium text-primary">
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>

              {/* Login Button */}
              <Pressable
                className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 px-4 shadow-sm active:opacity-90"
                onPress={handleSignIn}
                disabled={loading}
              >
                <Text className="text-base font-bold text-white leading-normal tracking-wide">
                  {loading ? 'Loading...' : 'Login'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Continue Without Account */}
        <View className="px-6 pb-4">
          <Pressable
            onPress={continueAnonymous}
            className="w-full py-4 items-center active:opacity-80"
          >
            <Text className="text-base font-bold text-primary">
              Continuar sem conta
            </Text>
            <Text className="text-xs text-text-secondary mt-1">
              Use o app offline e crie conta depois
            </Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="px-6 pb-4">
          <View className="flex flex-row items-center">
            <View className="flex-grow border-t border-gray-200" />
          </View>
        </View>

        {/* Sign Up Link */}
        <View className="pb-12 pt-4 text-center items-center" style={{ marginBottom: 40 }}>
          <Text className="text-text-secondary">
            Don't have an account?{' '}
            <Pressable onPress={() => router.push('/auth/signup')}>
              <Text className="font-bold text-primary">Sign Up</Text>
            </Pressable>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
