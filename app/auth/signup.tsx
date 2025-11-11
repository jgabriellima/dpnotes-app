/**
 * Sign Up Screen - dpnotes.ai
 * 
 * 100% fidelidade ao design de referência
 * Reference: docs/UX_UI_REFERENCES/signup/code.html
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image, KeyboardAvoidingView, Platform, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithTwitter, continueAnonymous } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      // Navigation handled by AuthContext
      Alert.alert('Sucesso!', 'Conta criada com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message || 'Não foi possível criar a conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    await signInWithGoogle();
    // Errors are handled inside signInWithGoogle
  };

  const handleTwitterSignUp = async () => {
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
        contentContainerClassName="min-h-screen"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex min-h-screen flex-col items-center justify-center p-6">
          <View className="flex w-full max-w-sm flex-col items-center">
            {/* Title and Subtitle */}
            <View className="mb-8 flex flex-col items-center text-center">
              <Text className="text-text-primary text-3xl font-bold leading-tight tracking-tight">
                Create an Account
              </Text>
              <Text className="text-text-secondary text-base font-normal leading-normal mt-2">
                Join dpnotes.ai to start your research journey.
              </Text>
            </View>

            {/* Social Login Buttons */}
            <View className="flex w-full flex-col gap-4">
              <Pressable 
                className="flex w-full flex-row items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 px-4 shadow-sm active:bg-gray-50"
                onPress={handleGoogleSignUp}
              >
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA' }}
                  className="h-6 w-6"
                />
                <Text className="text-center text-base font-medium leading-normal text-text-primary">
                  Continue with Google
                </Text>
              </Pressable>

              <Pressable 
                className="flex w-full flex-row items-center justify-center gap-2 rounded-xl bg-black py-3 active:opacity-90"
                onPress={handleTwitterSignUp}
              >
                <Text className="text-white text-xl font-bold">𝕏</Text>
                <Text className="text-center text-base font-medium leading-normal text-white">
                  Continue with X
                </Text>
              </Pressable>
            </View>

            {/* OR Divider */}
            <View className="my-6 flex w-full flex-row items-center">
              <View className="h-px flex-1 bg-primary" />
              <Text className="px-4 text-sm text-text-secondary">or</Text>
              <View className="h-px flex-1 bg-primary" />
            </View>

            {/* Sign Up Form */}
            <View className="w-full flex flex-col gap-4">
              {/* Name Input */}
              <View className="flex flex-col gap-1.5">
                <Text className="text-text-primary text-sm font-medium">
                  Name
                </Text>
                <TextInput
                  className="w-full rounded-lg border-0 bg-white py-3 px-4 text-text-primary text-base"
                  placeholder="Enter your name"
                  placeholderTextColor="#6C6F7D"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Email Input */}
              <View className="flex flex-col gap-1.5">
                <Text className="text-text-primary text-sm font-medium">
                  Email
                </Text>
                <TextInput
                  className="w-full rounded-lg border-0 bg-white py-3 px-4 text-text-primary text-base"
                  placeholder="Enter your email"
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
                <Text className="text-text-primary text-sm font-medium">
                  Password
                </Text>
                <TextInput
                  className="w-full rounded-lg border-0 bg-white py-3 px-4 text-text-primary text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#6C6F7D"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Confirm Password Input */}
              <View className="flex flex-col gap-1.5">
                <Text className="text-text-primary text-sm font-medium">
                  Confirm Password
                </Text>
                <TextInput
                  className="w-full rounded-lg border-0 bg-white py-3 px-4 text-text-primary text-base"
                  placeholder="Confirm your password"
                  placeholderTextColor="#6C6F7D"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Sign Up Button */}
            <Pressable
              className="mt-8 flex w-full items-center justify-center rounded-xl bg-primary py-4 shadow-sm active:bg-primary-light"
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text className="text-center text-base font-bold leading-normal tracking-wide text-text-primary">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </Pressable>

            {/* Continue Without Account */}
            <Pressable
              onPress={continueAnonymous}
              className="mt-6 py-4 items-center active:opacity-80"
            >
              <Text className="text-base font-bold text-primary">
                Continuar sem conta
              </Text>
              <Text className="text-xs text-text-secondary mt-1">
                Use o app offline e crie conta depois
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="my-4">
              <View className="flex flex-row items-center">
                <View className="flex-grow border-t border-gray-200" />
              </View>
            </View>

            {/* Log In Link */}
            <View className="mb-12" style={{ marginBottom: 40 }}>
              <Text className="text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Pressable onPress={() => router.push('/auth/signin')}>
                  <Text className="font-medium text-primary">Log In</Text>
                </Pressable>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
