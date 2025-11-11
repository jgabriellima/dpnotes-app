/**
 * Icon Component
 * 
 * Material Symbols Outlined icon wrapper using Lucide React Native.
 * Maps Material Symbols names to Lucide icons for React Native compatibility.
 */

import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { type IconProps as LucideIconProps } from 'lucide-react-native';

// Material Symbols to Lucide mapping
const iconMap: Record<string, keyof typeof LucideIcons> = {
  // Navigation & Actions
  'settings': 'Settings',
  'arrow_forward_ios': 'ChevronRight',
  'arrow_back': 'ChevronLeft',
  'more_vert': 'MoreVertical',
  'close': 'X',
  'add': 'Plus',
  'check': 'Check',
  'edit': 'Pencil',
  'delete': 'Trash2',
  'search': 'Search',
  
  // Projects & Documents
  'folder': 'Folder',
  'edit_square': 'FileEdit',
  'post_add': 'FilePlus',
  'content_paste_go': 'ClipboardPaste',
  
  // Annotations
  'sell': 'Tag',
  'mic': 'Mic',
  'note': 'StickyNote',
  'play_arrow': 'Play',
  'pause': 'Pause',
  'stop': 'Square',
  
  // Export & Share
  'ios_share': 'Share2',
  'content_copy': 'Copy',
  'download': 'Download',
  
  // User & Account
  'person': 'User',
  'notifications': 'Bell',
  'lock': 'Lock',
  'credit_card': 'CreditCard',
  
  // Status & Info
  'info': 'Info',
  'warning': 'AlertTriangle',
  'error': 'AlertCircle',
  'check_circle': 'CheckCircle',
};

interface IconProps extends Omit<LucideIconProps, 'name'> {
  name: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#2D313E', ...props }) => {
  const iconName = iconMap[name] || 'HelpCircle';
  const IconComponent = LucideIcons[iconName] as React.ComponentType<LucideIconProps>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in mapping. Using fallback.`);
    return <LucideIcons.HelpCircle size={size} color={color} {...props} />;
  }

  return <IconComponent size={size} color={color} {...props} />;
};

export default Icon;

