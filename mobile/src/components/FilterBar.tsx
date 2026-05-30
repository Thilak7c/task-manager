// src/components/FilterBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { TaskStatus } from '../api/tasks';

type Filter = TaskStatus | '';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

interface Props {
  value: Filter;
  onChange: (value: Filter) => void;
}

export function FilterBar({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => onChange(f.value)}
            style={[styles.chip, value === f.value && styles.chipActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, value === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  chipTextActive: {
    color: '#fff',
  },
});
