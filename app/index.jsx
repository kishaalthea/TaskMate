import React, { useRef, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const router = useRouter();

  // Animation for bouncing brand
  const bounceValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#fefbf6', '#e0d7ff']}
      style={styles.safe}
    >
      <View style={styles.container}>
        {/* Floating logo above the brand */}
        <Image 
          source={{ uri: 'https://img.icons8.com/emoji/96/000000/check-mark-emoji.png' }} 
          style={styles.logo} 
        />

        {/* Bouncing brand */}
        <Animated.Text style={[styles.brand, { transform: [{ scale: bounceValue }] }]}>
          TaskMate
        </Animated.Text>

        <Text style={styles.tagline}>Plan less. Do more.</Text>

        {/* Glowing buttons */}
        <TouchableOpacity
          style={styles.primary}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.primaryText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondary}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.secondaryText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Fun footer sparkle */}
        <Text style={styles.footer}>✨ Your productivity companion ✨</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    color: '#4A3AFF',
    letterSpacing: 1.2,
    textShadowColor: '#9c8fff',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#6e6e6e',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  primary: {
    width: '80%',
    maxWidth: 280,
    paddingVertical: 14,
    backgroundColor: '#4A3AFF',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4A3AFF',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5
  },
  secondary: {
    width: '80%',
    maxWidth: 280,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4A3AFF',
    backgroundColor: '#fff',
  },
  secondaryText: {
    color: '#4A3AFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    marginTop: 60,
    fontSize: 14,
    color: '#a48fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
