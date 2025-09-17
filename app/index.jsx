import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useRouter, Link } from 'expo-router'


export default function Home() {
const router = useRouter()


return (
<View style={styles.container}>
<Text style={styles.title}>T A S K M A T E</Text>


<TouchableOpacity
style={styles.primary}
onPress={() => router.push('/login')}
accessibilityLabel="Go to Login"
>
<Text style={styles.primaryText}>Login</Text>
</TouchableOpacity>


<TouchableOpacity
style={styles.secondary}
onPress={() => router.push('/signup')}
accessibilityLabel="Go to Signup"
>
<Text style={styles.secondaryText}>Sign up</Text>
</TouchableOpacity>


<View style={styles.quickLinks}>
<Link href="/goals" style={styles.link}>View Your Goals</Link>
<Link href="/goals/create" style={styles.link}>Add a New Goal</Link>
</View>


<Text style={styles.small}>This demo stores credentials only on the device (AsyncStorage).</Text>
</View>
)
}


const styles = StyleSheet.create({
container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
title: { fontSize: 28, marginBottom: 30, letterSpacing: 6 },
primary: { width: '80%', padding: 16, backgroundColor: '#21cc8d', borderRadius: 10, alignItems: 'center' },
primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
secondary: { marginTop: 12, width: '80%', padding: 16, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#21cc8d' },
secondaryText: { color: '#21cc8d', fontSize: 16, fontWeight: '600' },
quickLinks: { marginTop: 28 },
link: { marginVertical: 8, color: 'white', padding: 12, backgroundColor: '#0b8f6c', borderRadius: 8, overflow: 'hidden', textAlign: 'center' },
small: { marginTop: 24, color: '#666', textAlign: 'center' }
})