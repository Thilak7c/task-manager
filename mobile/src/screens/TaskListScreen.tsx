// src/screens/TaskListScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskList } from '../hooks/useTaskList';
import { Task, TaskStatus } from '../api/tasks';
import { TaskItem } from '../components/TaskItem';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';

export function TaskListScreen() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');

  const { tasks, meta, isLoading, isRefreshing, isOffline, error, refresh, toggleTaskStatus, deleteTask } =
    useTaskList({ status: statusFilter, per_page: 20 });

  function handleDelete(task: Task) {
    Alert.alert(
      'Delete Task',
      `Delete "${task.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTask(task.id),
        },
      ]
    );
  }

  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onToggle={() => toggleTaskStatus(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        {meta && (
          <Text style={styles.headerCount}>{meta.total} total</Text>
        )}
      </View>

      {/* Offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            📡 You're offline — showing cached data
          </Text>
        </View>
      )}

      {/* Error banner */}
      {error && !isOffline && <ErrorBanner message={error} onRetry={refresh} />}

      {/* Filters */}
      <FilterBar value={statusFilter} onChange={setStatusFilter} />

      {/* List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState message={statusFilter ? `No ${statusFilter} tasks.` : 'No tasks yet.'} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerCount: {
    fontSize: 13,
    color: '#94a3b8',
  },
  offlineBanner: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  offlineText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 8,
  },
});
