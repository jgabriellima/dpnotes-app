/**
 * Modal Component
 * 
 * Bottom sheet modal component following UI specifications.
 * Used for annotation modal and other overlay interactions.
 */

import React from 'react';
import { 
  View, 
  Modal as RNModal, 
  Pressable, 
  ScrollView,
  type ModalProps as RNModalProps,
  Dimensions,
} from 'react-native';
import { cn } from '../../utils/cn';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModalProps extends RNModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number | string;
  showHandle?: boolean;
}

export const BottomSheetModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  maxHeight = '90%',
  showHandle = true,
  ...props
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      {...props}
    >
      <Pressable 
        className="absolute inset-0 flex flex-col justify-end bg-black/50"
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View 
            className="flex flex-col bg-white rounded-t-xl overflow-hidden"
            style={{ 
              maxHeight: typeof maxHeight === 'string' 
                ? SCREEN_HEIGHT * (parseInt(maxHeight) / 100)
                : maxHeight 
            }}
          >
            {showHandle && (
              <View className="flex h-5 w-full items-center justify-center pt-3">
                <View className="h-1 w-9 rounded-full bg-gray-300" />
              </View>
            )}
            <ScrollView 
              className="px-4 pt-4 pb-6"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

/**
 * Full Screen Modal
 * Used for screens that need full overlay
 */
interface FullScreenModalProps extends RNModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  visible,
  onClose,
  children,
  ...props
}) => {
  return (
    <RNModal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 bg-white">
        {children}
      </View>
    </RNModal>
  );
};

export default BottomSheetModal;

