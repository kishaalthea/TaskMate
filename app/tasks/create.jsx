import React, { useState, useRef, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState('normal');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title to continue.');
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Authentication Error', 'You must be logged in to create tasks');
        setSaving(false);
        return;
      }

      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        title: title.trim(),
        note: note.trim(),
        priority: priority,
        category: category.trim() || null,
        completed: false,
        createdAt: serverTimestamp(),
      });

      // Success animation before navigation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/tasks');
      });
    } catch (err) {
      setSaving(false);
      Alert.alert('Save Failed', err.message);
    }
  };

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFE66D';
      case 'low': return '#4ECDC4';
      default: return '#E0E0E0';
    }
  };

  const renderPriorityButton = (priorityLevel, label, emoji) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === priorityLevel && styles.priorityButtonActive,
        { borderColor: getPriorityColor(priorityLevel) }
      ]}
      onPress={() => setPriority(priorityLevel)}
    >
      <Text style={styles.priorityEmoji}>{emoji}</Text>
      <Text style={[
        styles.priorityText,
        priority === priorityLevel && styles.priorityTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <Animated.View style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create New Task</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Task Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                placeholder="What needs to be done?"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholderTextColor="#999"
                returnKeyType="next"
              />
            </View>

            {/* Priority Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority Level</Text>
              <View style={styles.priorityContainer}>
                {renderPriorityButton('high', 'High', '🔴')}
                {renderPriorityButton('medium', 'Medium', '🟡')}
                {renderPriorityButton('low', 'Low', '🟢')}
                {renderPriorityButton('normal', 'Normal', '⚪')}
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                placeholder="Work, Personal, Shopping..."
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                placeholderTextColor="#999"
                returnKeyType="next"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                placeholder="Add any additional details..."
                value={note}
                onChangeText={setNote}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[
                  styles.primaryButton,
                  saving && styles.primaryButtonDisabled
                ]} 
                onPress={onSave}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? 'Creating...' : '✓ Create Task'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  keyboardContainer: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 20,
    color: '#6C5CE7',
  },
  title: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#2C3E50',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },

  // Form
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Priority Selection
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  priorityButtonActive: {
    backgroundColor: '#F8F9FA',
    transform: [{ scale: 0.98 }],
  },
  priorityEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  priorityTextActive: {
    color: '#2C3E50',
  },

  // Buttons
  buttonContainer: {
    marginTop: 40,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0.1,
  },
  primaryButtonText: { 
    color: '#fff', 
    fontWeight: '800',
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: { 
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
});