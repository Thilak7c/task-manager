// src/components/TaskItem.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Task } from '../api/tasks';

const PRIORITY_COLORS = {
  high:   { bg: '#fee2e2', text: '#b91c1c' },
  medium: { bg: '#fef3c7', text: '#b45309' },
  low:    { bg: '#dcfce7', text: '#15803d' },
};

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onToggle, onDelete }: Props) {
  const isCompleted = task.status === 'completed';
  const priorityColor = PRIORITY_COLORS[task.priority];

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      {/* Checkbox */}
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
        activeOpacity={0.7}
        accessibilityLabel={isCompleted ? 'Mark as pending' : 'Mark as completed'}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: priorityColor.bg }]}>
            <Text style={[styles.badgeText, { color: priorityColor.text }]}>
              {task.priority}
            </Text>
          </View>
        </View>

        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <Text style={styles.date}>
          {new Date(task.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Delete */}
      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
        accessibilityLabel="Delete task"
        activeOpacity={0.7}
      >
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  cardCompleted: {
    opacity: 0.65,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  date: {
    marginTop: 6,
    fontSize: 11,
    color: '#94a3b8',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 2,
  },
  deleteIcon: {
    fontSize: 16,
  },
});
