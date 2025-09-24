import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { fetchTasks, deleteTask } from '../utils/tasks';

export default function TasksList() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (!u) router.replace('/login');
        else {
          setUser(u);
          load();
        }
      });
      return unsub;
    }, [])
  );

  const load = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const onDelete = (id) => {
    Alert.alert('Delete task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTask(id); load(); } },
    ]);
  };

  const logout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.note ? <Text style={styles.taskNote}>{item.note}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.link} onPress={() => router.push(`/tasks/${item.id}`)}>
          <Text style={styles.linkText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.delete} onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Tasks</Text>
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {tasks.length === 0 && !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No tasks yet — start with a small one.</Text>
              <TouchableOpacity style={styles.primary} onPress={() => router.push('/tasks/create')}>
                <Text style={styles.primaryText}>Create your first task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(i) => i.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 12 }}
            />
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primary} onPress={() => router.push('/tasks/create')}>
            <Text style={styles.primaryText}>+ New Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fefbf6' },
  container: { flex: 1, backgroundColor: '#fefbf6' },

  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#4A3AFF' },
  logout: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  logoutText: { color: '#4A3AFF' },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#5d5a88', marginBottom: 16 },

  footer: { padding: 20 },
  primary: {
    width: '100%',
    padding: 14,
    backgroundColor: '#4A3AFF',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#fff', fontWeight: '700' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  taskNote: { color: '#666', marginTop: 4 },

  actions: { marginLeft: 12, alignItems: 'flex-end' },
  link: { padding: 6 },
  linkText: { color: '#4A3AFF' },
  delete: { padding: 6 },
  deleteText: { color: '#d9534f' },
});
