/**
 * Badge Component
 * 
 * Elegant badge components for labels, tags, and annotations.
 * Used in the text editor to display annotations.
 */

import React from 'react';
import { Pressable, Text, View, type PressableProps } from 'react-native';
import { cn } from '../../utils/cn';

interface BadgeProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  icon,
  variant = 'default',
  size = 'md',
  className,
  onPress,
  ...props
}) => {
  const Component = onPress ? Pressable : View;

  const baseClasses = 'inline-flex flex-row items-center rounded';
  
  const variantClasses = {
    default: 'bg-badge',
    outline: 'border border-primary bg-transparent',
  };

  const sizeClasses = {
    sm: 'h-5 px-1.5 gap-0.5',
    md: 'h-6 px-2 gap-1',
  };

  const textSizeClasses = {
    sm: 'text-[11px]',
    md: 'text-xs',
  };

  return (
    <Component
      onPress={onPress}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        onPress && 'active:opacity-70',
        className
      )}
      {...props}
    >
      {icon && <View className="flex items-center justify-center">{icon}</View>}
      {typeof children === 'string' ? (
        <Text className={cn('text-primary font-medium', textSizeClasses[size])}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Component>
  );
};

/**
 * Icon Badge Component
 * Used for audio and note indicators
 */
interface IconBadgeProps extends PressableProps {
  icon: React.ReactNode;
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  className,
  ...props
}) => {
  return (
    <Pressable
      className={cn(
        'size-6 flex items-center justify-center',
        'bg-badge rounded text-primary',
        'active:opacity-70',
        className
      )}
      {...props}
    >
      {icon}
    </Pressable>
  );
};

/**
 * Label Chip Component
 * Used in annotation modal for selectable labels
 */
interface LabelChipProps extends PressableProps {
  label: string;
  selected?: boolean;
}

export const LabelChip: React.FC<LabelChipProps> = ({
  label,
  selected = false,
  className,
  ...props
}) => {
  return (
    <Pressable
      className={cn(
        'flex h-8 items-center justify-center px-3 rounded-full',
        selected ? 'bg-primary' : 'bg-primary-light',
        'active:opacity-80 transition-opacity',
        className
      )}
      {...props}
    >
      <Text className={cn(
        'text-sm font-medium',
        selected ? 'text-[#8B2500]' : 'text-[#8B2500]/80'
      )}>
        {label}
      </Text>
    </Pressable>
  );
};

/**
 * Add Label Button
 * Dashed border button for creating new labels
 */
interface AddLabelButtonProps extends PressableProps {
  label?: string;
}

export const AddLabelButton: React.FC<AddLabelButtonProps> = ({
  label = 'Nova Label',
  className,
  ...props
}) => {
  return (
    <Pressable
      className={cn(
        'flex h-8 flex-row items-center justify-center gap-2 px-3 rounded-full',
        'border border-dashed border-primary',
        'bg-transparent',
        'active:bg-primary-lightest transition-colors',
        className
      )}
      {...props}
    >
      <Text className="text-[#8B2500]/80 text-base">+</Text>
      <Text className="text-sm font-medium text-[#8B2500]/80">
        {label}
      </Text>
    </Pressable>
  );
};

export default Badge;

