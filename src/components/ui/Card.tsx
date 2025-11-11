/**
 * Card Component
 * 
 * Elegant card component for displaying grouped content.
 * Used for projects, settings options, and other grouped information.
 */

import React from 'react';
import { View, Pressable, Text, type ViewProps, type PressableProps } from 'react-native';
import { cn } from '../../utils/cn';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  padding = 'md', 
  className, 
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View
      className={cn(
        'bg-white rounded-xl',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};

/**
 * Project Card Component
 * Used in home screen and projects list
 */
interface ProjectCardProps extends PressableProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onMenuPress?: () => void;
  menuIcon?: React.ReactNode;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  icon,
  title,
  subtitle,
  onMenuPress,
  menuIcon,
  className,
  ...props
}) => {
  return (
    <Pressable
      className={cn(
        'flex flex-col gap-3 p-4 bg-white rounded-xl',
        'active:opacity-80 transition-opacity',
        className
      )}
      {...props}
    >
      <View className="flex flex-row items-start justify-between">
        <View className="flex flex-row items-center gap-3 flex-1">
          <View className="size-12 flex items-center justify-center bg-primary-lighter rounded-lg text-primary">
            {icon}
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-bold text-base leading-tight">
              {title}
            </Text>
            <Text className="text-text-secondary text-sm leading-normal mt-0.5">
              {subtitle}
            </Text>
          </View>
        </View>
        {onMenuPress && (
          <Pressable 
            onPress={onMenuPress}
            className="text-text-secondary p-1"
          >
            {menuIcon}
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

/**
 * Settings Option Card
 * Used in settings screens
 */
interface SettingsCardProps extends PressableProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  showArrow?: boolean;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  title,
  description,
  showArrow = true,
  className,
  ...props
}) => {
  return (
    <Pressable
      className={cn(
        'flex flex-row items-center gap-4 p-4',
        'bg-white rounded-xl',
        'active:bg-primary-lightest transition-colors',
        className
      )}
      {...props}
    >
      <View className="size-10 flex items-center justify-center bg-primary-lighter rounded-lg text-primary">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-text-primary font-medium text-base leading-tight">
          {title}
        </Text>
        {description && (
          <Text className="text-text-secondary text-sm leading-normal mt-0.5">
            {description}
          </Text>
        )}
      </View>
      {showArrow && (
        <Text className="text-text-secondary text-xl">›</Text>
      )}
    </Pressable>
  );
};

/**
 * Action Card Component
 * Used for create project options
 */
interface ActionCardProps extends PressableProps {
  icon: React.ReactNode;
  title: string;
  showArrow?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  showArrow = true,
  className,
  ...props
}) => {
  return (
    <Pressable
      className={cn(
        'flex flex-row items-center gap-4 rounded-lg bg-primary-lightest p-4',
        'active:opacity-80 transition-opacity',
        className
      )}
      {...props}
    >
      <View className="size-10 flex items-center justify-center rounded-lg bg-primary-lighter text-primary">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-text-primary text-base font-medium leading-normal">
          {title}
        </Text>
      </View>
      {showArrow && (
        <Text className="text-text-secondary text-xl">›</Text>
      )}
    </Pressable>
  );
};

export default Card;

