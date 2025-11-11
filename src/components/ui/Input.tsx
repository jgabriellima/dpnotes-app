/**
 * Input Component
 * 
 * Elegant input components for forms following UI specifications.
 * Includes TextInput and TextArea variants.
 */

import React, { forwardRef } from 'react';
import { TextInput as RNTextInput, View, Text, type TextInputProps } from 'react-native';
import { cn } from '../../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<RNTextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  ...props
}, ref) => {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-text-primary text-sm font-medium mb-2">
          {label}
        </Text>
      )}
      <View className="relative w-full">
        {leftIcon && (
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            {leftIcon}
          </View>
        )}
        <RNTextInput
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-white',
            'border border-primary-light rounded-lg',
            'text-text-primary text-base',
            'placeholder:text-text-secondary',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            'transition-colors',
            error && 'border-destructive',
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            className
          )}
          placeholderTextColor="#6C6F7D"
          {...props}
        />
        {rightIcon && (
          <View className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text className="text-destructive text-sm mt-1.5">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text className="text-text-secondary text-sm mt-1.5">
          {helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

/**
 * TextArea Component
 * Multi-line text input
 */
interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  minHeight?: number;
}

export const TextArea = forwardRef<RNTextInput, TextAreaProps>(({
  label,
  error,
  helperText,
  minHeight = 100,
  className,
  ...props
}, ref) => {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-text-primary text-sm font-medium mb-2">
          {label}
        </Text>
      )}
      <RNTextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        style={{ minHeight }}
        className={cn(
          'w-full px-3 py-3 bg-white',
          'border border-primary-light rounded-lg',
          'text-text-primary text-base',
          'placeholder:text-text-secondary',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          'transition-colors',
          error && 'border-destructive',
          className
        )}
        placeholderTextColor="#6C6F7D"
        {...props}
      />
      {error && (
        <Text className="text-destructive text-sm mt-1.5">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text className="text-text-secondary text-sm mt-1.5">
          {helperText}
        </Text>
      )}
    </View>
  );
});

TextArea.displayName = 'TextArea';

export default Input;

