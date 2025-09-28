import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useCallback, useState, useRef } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  TextInput,
  StatusBar,
  Modal,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../../firebaseConfig';
import { deleteTask, fetchTasks } from '../utils/tasks';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

// ✅ Toast helper
const showToast = (type, text1, text2) => {
  Toast.show({
    type, // 'success' | 'error' | 'info'
    text1,
    text2,
    position: 'bottom',
    visibilityTime: 2000,
  });
};

export default function TasksList() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showStats, setShowStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useFocusEffect(
    useCallback(() => {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (!u) router.replace('/login');
        else {
          setUser(u);
          load();
          // Animate entrance
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
      return unsub;
    }, [])
  );

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
      filterTasks(data, searchQuery, selectedFilter);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filterTasks = (taskList, query, filter) => {
    let filtered = taskList;

    // Search filter
    if (query) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          (task.note && task.note.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Status filter
    switch (filter) {
      case 'completed':
        filtered = filtered.filter((task) => task.completed === true);
        break;
      case 'pending':
        filtered = filtered.filter((task) => task.completed !== true);
        break;
      case 'priority':
        filtered = filtered.filter((task) => task.priority === 'high');
        break;
      default:
        break;
    }

    setFilteredTasks(filtered);
  };

  const onSearch = (text) => {
    setSearchQuery(text);
    filterTasks(tasks, text, selectedFilter);
  };

  const onFilterChange = (filter) => {
    setSelectedFilter(filter);
    filterTasks(tasks, searchQuery, filter);
  };

  const toggleTaskComplete = async (task) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    filterTasks(updatedTasks, searchQuery, selectedFilter);
  };

  const onDelete = (id) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this task?');
      if (confirmed) {
        deleteTask(id)
          .then(() => {
            load();
            showToast('success', 'Task deleted');
          })
          .catch((err) => {
            showToast('error', 'Delete failed', err.message);
          });
      }
    } else {
      Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(id);
              load();
              showToast('success', 'Task deleted');
            } catch (err) {
              showToast('error', 'Delete failed', err.message);
            }
          },
        },
      ]);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showToast('success', 'Signed out', 'See you soon 👋');
      setTimeout(() => router.replace('/login'), 1200);
    } catch (error) {
      console.error('Logout error:', error);
      showToast('error', 'Logout Error', error.message);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed === true).length;
    const pending = total - completed;
    const highPriority = tasks.filter((t) => t.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, highPriority, completionRate };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#FF6B6B';
      case 'medium':
        return '#FFE66D';
      case 'low':
        return '#4ECDC4';
      default:
        return '#E0E0E0';
    }
  };

  const renderFilterButton = (filter, icon, label) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === filter && styles.filterChipActive,
      ]}
      onPress={() => onFilterChange(filter)}
    >
      <Text style={styles.filterIcon}>{icon}</Text>
      <Text
        style={[
          styles.filterLabel,
          selectedFilter === filter && styles.filterLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTaskItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
            onPress={() => toggleTaskComplete(item)}
          >
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View
            style={[
              styles.priorityIndicator,
              { backgroundColor: getPriorityColor(item.priority) },
            ]}
          />
        </View>

        <View style={styles.cardContent}>
          <Text
            style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}
          >
            {item.title}
          </Text>
          {item.note ? (
            <Text
              style={[styles.taskNote, item.completed && styles.taskNoteCompleted]}
            >
              {item.note}
            </Text>
          ) : null}

          {item.dueDate && (
            <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
          )}

          <View style={styles.taskMeta}>
            <Text style={styles.priorityText}>
              {item.priority || 'normal'} priority
            </Text>
            {item.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/tasks/${item.id}`)}
          >
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(item.id)}
          >
            <Text style={styles.deleteAction}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const stats = getTaskStats();

  return (
    <LinearGradient colors={['#fefbf6', '#e0d7ff']} style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fefbf6" />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              {stats.total > 0
                ? `${stats.completed}/${stats.total} tasks completed (${stats.completionRate}%)`
                : 'Ready to be productive?'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.statsButton}
              onPress={() => setShowStats(true)}
            >
              <Text style={styles.statsButtonText}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>↗️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={onSearch}
            placeholderTextColor="#999"
          />
        </View>

        {/* Quick Filters */}
        <View style={styles.quickFilters}>
          {renderFilterButton('all', '📝', 'All')}
          {renderFilterButton('pending', '⏳', 'Todo')}
          {renderFilterButton('completed', '✅', 'Done')}
          {renderFilterButton('priority', '🔥', 'Hot')}
        </View>

        {/* Task List */}
        <View style={styles.listContainer}>
          {filteredTasks.length === 0 && !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>
                {searchQuery
                  ? '🔍'
                  : selectedFilter === 'completed'
                  ? '✅'
                  : '📝'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No tasks match your search'
                  : selectedFilter === 'completed'
                  ? 'No completed tasks yet'
                  : selectedFilter === 'priority'
                  ? 'No high priority tasks'
                  : 'No tasks yet — start with a small one.'}
              </Text>
              {!searchQuery && selectedFilter === 'all' && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push('/tasks/create')}
                >
                  <Text style={styles.primaryButtonText}>Create your first task</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredTasks}
              keyExtractor={(item) => item.id}
              renderItem={renderTaskItem}
              contentContainerStyle={styles.listContent}
              refreshing={refreshing}
              onRefresh={onRefresh}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/tasks/create')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* Stats Modal */}
        <Modal
          visible={showStats}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStats(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.statsModal}>
              <Text style={styles.statsTitle}>📊 Your Progress</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total Tasks</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#4ECDC4' }]}>
                    {stats.completed}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#FFE66D' }]}>
                    {stats.pending}
                  </Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>
                    {stats.highPriority}
                  </Text>
                  <Text style={styles.statLabel}>High Priority</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Completion Rate</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${stats.completionRate}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{stats.completionRate}%</Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowStats(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4A3AFF',
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: '#6e6e6e', fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  statsButton: { padding: 12, marginRight: 8 },
  statsButtonText: { fontSize: 20 },
  logoutButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 58, 255, 0.2)',
  },
  logoutText: { fontSize: 18, color: '#4A3AFF' },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 15 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 58, 255, 0.1)',
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
    justifyContent: 'space-around',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 58, 255, 0.2)',
  },
  filterChipActive: { backgroundColor: '#4A3AFF', borderColor: '#4A3AFF' },
  filterIcon: { fontSize: 14, marginRight: 4 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#6e6e6e' },
  filterLabelActive: { color: '#fff' },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  listContent: { paddingBottom: 100 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 58, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: { backgroundColor: '#4ECDC4', borderColor: '#4ECDC4' },
  checkmark: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  priorityIndicator: { width: 4, height: 24, borderRadius: 2 },
  cardContent: { padding: 16, paddingTop: 8 },
  taskTitle: { fontSize: 18, fontWeight: '700', color: '#4A3AFF', marginBottom: 4 },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskNote: { fontSize: 14, color: '#6e6e6e' },
  taskNoteCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  dueDate: { fontSize: 12, color: '#FF6B6B', marginTop: 4 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  priorityText: { fontSize: 12, color: '#6e6e6e', marginRight: 8 },
  categoryTag: {
    backgroundColor: '#E0D7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#4A3AFF' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(74, 58, 255, 0.1)',
  },
  actionButton: { padding: 8, marginLeft: 8 },
  actionText: { fontSize: 18 },
  deleteAction: { fontSize: 18, color: '#FF6B6B' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyText: { fontSize: 16, textAlign: 'center', color: '#6e6e6e', marginBottom: 16 },
  primaryButton: {
    backgroundColor: '#4A3AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4A3AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A3AFF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsModal: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#4A3AFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: { width: '45%', marginBottom: 20, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#4A3AFF' },
  statLabel: { fontSize: 12, color: '#6e6e6e' },
  progressSection: { width: '100%', marginBottom: 20 },
  progressLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#EEE',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A3AFF',
    borderRadius: 5,
  },
  progressText: { fontSize: 12, color: '#6e6e6e', textAlign: 'right', marginTop: 4 },
  closeButton: {
    backgroundColor: '#4A3AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  closeButtonText: { color: '#fff', fontWeight: '600' },
});
