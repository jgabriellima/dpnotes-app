/**
 * Manage Tags Screen
 * 
 * Screen for managing predefined and custom labels/tags.
 * Allows creating, editing, and deleting custom tags.
 * 
 * Reference: docs/UX_UI_REFERENCES/manage-tags-list/
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePredefinedLabels, useCustomLabels, useDeleteLabel } from '../../src/hooks/useLabels';
import { Icon } from '../../src/components/ui/Icon';
import { BottomSheetModal } from '../../src/components/ui/Modal';
import { Input, TextArea } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useCreateLabel, useUpdateLabel } from '../../src/hooks/useLabels';

export default function ManageTagsScreen() {
  const router = useRouter();
  const { data: predefinedLabels = [] } = usePredefinedLabels();
  const { data: customLabels = [] } = useCustomLabels();
  const deleteLabel = useDeleteLabel();
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [labelName, setLabelName] = useState('');
  const [labelDescription, setLabelDescription] = useState('');

  const handleCreateLabel = async () => {
    if (!labelName.trim()) {
      Alert.alert('Nome obrigatório', 'Digite um nome para a label.');
      return;
    }

    try {
      await createLabel.mutateAsync({
        name: labelName.trim(),
        description: labelDescription.trim() || null,
        color: '#ffccc3',
      });

      setShowAddModal(false);
      setLabelName('');
      setLabelDescription('');
      Alert.alert('Sucesso', 'Label criada!');
    } catch (error) {
      console.error('Create label error:', error);
      Alert.alert('Erro', 'Não foi possível criar a label.');
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel || !labelName.trim()) {
      return;
    }

    try {
      await updateLabel.mutateAsync({
        id: editingLabel.id,
        name: labelName.trim(),
        description: labelDescription.trim() || null,
      });

      setEditingLabel(null);
      setLabelName('');
      setLabelDescription('');
      Alert.alert('Sucesso', 'Label atualizada!');
    } catch (error) {
      console.error('Update label error:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a label.');
    }
  };

  const handleEditPress = (label: { id: string; name: string; description: string | null }) => {
    setEditingLabel(label);
    setLabelName(label.name);
    setLabelDescription(label.description || '');
  };

  const handleDeletePress = (labelId: string, labelName: string) => {
    Alert.alert(
      'Excluir Label',
      `Tem certeza que deseja excluir "${labelName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleDelete(labelId),
        },
      ]
    );
  };

  const handleDelete = async (labelId: string) => {
    try {
      await deleteLabel.mutateAsync(labelId);
      Alert.alert('Sucesso', 'Label excluída!');
    } catch (error) {
      console.error('Delete label error:', error);
      Alert.alert('Erro', 'Não foi possível excluir a label.');
    }
  };

  return (
    <View className="flex-1 bg-primary-lightest">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 pt-12 pb-4 bg-primary-lightest border-b border-primary-light">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow_back" size={24} color="#2D313E" />
        </Pressable>

        <Text className="text-lg font-bold text-text-primary flex-1 text-center px-4">
          Manage Tags
        </Text>

        <Pressable onPress={() => router.back()}>
          <Text className="text-base font-bold text-primary">
            Done
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 gap-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Predefined Labels */}
        <View className="flex flex-col gap-3">
          <Text className="text-sm font-semibold uppercase text-primary-light mb-2">
            PRE-DEFINED
          </Text>
          {predefinedLabels.map(label => (
            <View
              key={label.id}
              className="flex flex-row items-center p-3 bg-white rounded-lg"
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-primary leading-tight">
                  {label.name}
                </Text>
                {label.description && (
                  <Text className="text-sm text-primary-light mt-0.5">
                    {label.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Custom Labels */}
        <View className="flex flex-col gap-3">
          <Text className="text-sm font-semibold uppercase text-primary-light mb-2">
            CUSTOM
          </Text>
          {customLabels.length > 0 ? (
            customLabels.map(label => (
              <View
                key={label.id}
                className="flex flex-row items-center p-3 bg-white rounded-lg"
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-primary leading-tight">
                    {label.name}
                  </Text>
                  {label.description && (
                    <Text className="text-sm text-primary-light mt-0.5">
                      {label.description}
                    </Text>
                  )}
                </View>
                <View className="flex flex-row items-center gap-1">
                  <Pressable
                    onPress={() => handleEditPress(label)}
                    className="size-9 flex items-center justify-center rounded-full active:bg-primary-lightest"
                  >
                    <Icon name="edit" size={20} color="#ffd9d2" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeletePress(label.id, label.name)}
                    className="size-9 flex items-center justify-center rounded-full active:bg-destructive-light"
                  >
                    <Icon name="delete" size={20} color="#ffd9d2" />
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View className="py-8">
              <Text className="text-text-secondary text-sm text-center">
                Nenhuma label customizada ainda
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-6 right-4 size-14 flex items-center justify-center rounded-xl bg-primary shadow-lg active:scale-95"
      >
        <Icon name="add" size={32} color="#8B2500" />
      </Pressable>

      {/* Add/Edit Label Modal */}
      <BottomSheetModal
        visible={showAddModal || editingLabel !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingLabel(null);
          setLabelName('');
          setLabelDescription('');
        }}
      >
        <View className="flex flex-col gap-4">
          <Text className="text-xl font-bold text-text-primary">
            {editingLabel ? 'Editar Label' : 'Nova Label'}
          </Text>

          <Input
            label="Nome da Label"
            placeholder="Ex: Key Concept"
            value={labelName}
            onChangeText={setLabelName}
            autoFocus
          />

          <TextArea
            label="Descrição (Opcional)"
            placeholder="Adicione uma breve descrição..."
            value={labelDescription}
            onChangeText={setLabelDescription}
            minHeight={80}
          />

          <View className="flex flex-row gap-3 mt-4">
            <Button
              variant="secondary"
              onPress={() => {
                setShowAddModal(false);
                setEditingLabel(null);
                setLabelName('');
                setLabelDescription('');
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onPress={editingLabel ? handleUpdateLabel : handleCreateLabel}
              loading={createLabel.isPending || updateLabel.isPending}
              fullWidth
            >
              {editingLabel ? 'Atualizar' : 'Criar'}
            </Button>
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
}
