/**
 * Button Component
 * 
 * Elegant button component following the UI specifications.
 * Implements Primary, Secondary, and Ghost variants with proper styling.
 */

import React from 'react';
import { Pressable, Text, View, ActivityIndicator, type PressableProps } from 'react-native';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = 'flex flex-row items-center justify-center rounded-lg transition-opacity';
  
  const variantClasses = {
    primary: 'active:opacity-80',
    secondary: 'bg-primary-lighter active:opacity-80',
    ghost: 'bg-transparent active:bg-primary-lightest',
    destructive: 'bg-destructive active:opacity-80',
  };

  const sizeClasses = {
    sm: 'h-10 px-3 gap-1.5',
    md: 'h-12 px-4 gap-2',
    lg: 'h-14 px-6 gap-2.5',
  };

  const textVariantClasses = {
    primary: 'font-bold',
    secondary: 'text-text-primary font-semibold',
    ghost: 'text-text-secondary font-medium',
    destructive: 'text-white font-bold',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledClasses = 'opacity-50';

  return (
    <Pressable
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && disabledClasses,
        className
      )}
      style={variant === 'primary' ? { backgroundColor: '#ff6b52' } : undefined}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? '#fff' : '#2D313E'} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View>{icon}</View>}
          {typeof children === 'string' ? (
            <Text 
              className={cn(textVariantClasses[variant], textSizeClasses[size])}
              style={variant === 'primary' ? { color: '#ffffff' } : undefined}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === 'right' && <View>{icon}</View>}
        </>
      )}
    </Pressable>
  );
};

/**
 * Icon Button Component (Ghost variant for icons only)
 */
interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  };

  return (
    <Pressable
      className={cn(
        'flex items-center justify-center rounded-lg',
        'text-text-secondary active:bg-primary-lightest',
        'transition-colors',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
    </Pressable>
  );
};

export default Button;

