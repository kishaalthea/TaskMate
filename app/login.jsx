import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Platform, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Toast from 'react-native-toast-message';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animated header
  const bounce = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1.05, duration: 700, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ✅ Toast wrapper
  const showToast = (type, text1, text2) => {
    Toast.show({
      type, // 'success' | 'error' | 'info'
      text1,
      text2,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', 'Login Failed', 'Enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      showToast('success', 'Welcome back!', 'You are logged in');
      // small delay so user sees toast before navigation
      setTimeout(() => router.replace('/tasks'), 1200);
    } catch (err) {
      setLoading(false);
      showToast('error', 'Login Failed', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.gradient}>
        <View style={styles.container}>
          <Animated.Text style={[styles.title, { transform: [{ scale: bounce }] }]}>
            Welcome back!
          </Animated.Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.primary} onPress={handleLogin} disabled={loading}>
            <Text style={styles.primaryText}>{loading ? 'Logging in...' : 'Log in'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/signup')} style={styles.link}>
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.link}>
            <Text style={styles.linkText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: {
    flex: 1,
    backgroundColor: '#fefbf6',
    backgroundImage: 'linear-gradient(to bottom, #fefbf6, #e0d7ff)',
  },
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, marginBottom: 20, textAlign: 'center', color: '#4A3AFF', fontWeight: '700' },

  input: {
    width: '80%',
    maxWidth: 280,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },

  primary: {
    width: '80%',
    maxWidth: 280,
    paddingVertical: 14,
    backgroundColor: '#4A3AFF',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4A3AFF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  link: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#5d5a88' },
});
