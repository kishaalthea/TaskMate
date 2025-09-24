import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditTask() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'You must be logged in');
          router.replace('/login');
          return;
        }

        const ref = doc(db, 'users', user.uid, 'tasks', id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          Alert.alert('Not found');
          router.replace('/tasks');
          return;
        }

        const data = snap.data();
        setTitle(data.title);
        setNote(data.note || '');
      } catch (err) {
        Alert.alert('Error', err.message);
      }
    };
    load();
  }, [id]);

  const onSave = async () => {
    if (!title.trim()) return Alert.alert('Please enter a title');

    try {
      const user = auth.currentUser;
      if (!user) return Alert.alert('Error', 'No user logged in');

      const ref = doc(db, 'users', user.uid, 'tasks', id);
      await updateDoc(ref, {
        title: title.trim(),
        note: note.trim(),
      });

      router.replace('/tasks');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Task</Text>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Note (optional)"
          value={note}
          onChangeText={setNote}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        <TouchableOpacity style={styles.primary} onPress={onSave}>
          <Text style={styles.primaryText}>Save changes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fefbf6' },
  container: { padding: 20, flex: 1, backgroundColor: '#fefbf6' },
  title: { fontSize: 22, color: '#4A3AFF', marginBottom: 16, fontWeight: '700' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  primary: {
    width: '100%',
    padding: 14,
    backgroundColor: '#4A3AFF',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  cancelText: { color: '#5d5a88', textAlign: 'center' },
});
