import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'


export default function Login() {
const router = useRouter()
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)


const handleLogin = async () => {
if (!email || !password) return Alert.alert('Enter email and password')
setLoading(true)
try {
const raw = await AsyncStorage.getItem('users')
const users = raw ? JSON.parse(raw) : []
const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
if (!found) {
setLoading(false)
return Alert.alert('Invalid credentials')
}
await AsyncStorage.setItem('currentUser', JSON.stringify({ id: found.id, name: found.name, email: found.email }))
setLoading(false)
router.replace('/goals')
} catch (err) {
setLoading(false)
Alert.alert('Error', 'Could not log in')
}
}


return (
<SafeAreaView style={l.safe}>
<View style={l.container}>
<Text style={l.title}>Welcome back</Text>


<TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={l.input} />
<TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={l.input} />


<TouchableOpacity style={l.button} onPress={handleLogin} disabled={loading}>
<Text style={l.buttonText}>{loading ? 'Logging in...' : 'Log in'}</Text>
</TouchableOpacity>


<TouchableOpacity onPress={() => router.replace('/signup')} style={{ marginTop: 12 }}>
<Text style={{ color: '#5d5a88' }}>Don't have an account? Sign up</Text>
</TouchableOpacity>
</View>
</SafeAreaView>
)
}


const l = StyleSheet.create({
safe: { flex: 1, backgroundColor: '#fefbf6' },
container: { flex: 1, padding: 24, justifyContent: 'center' },
title: { fontSize: 22, marginBottom: 18, textAlign: 'center', color: '#5d5a88', fontWeight: '600' },
input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 12, backgroundColor: '#fff' },
button: { backgroundColor: '#a8dadc', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
buttonText: { color: '#fff', fontWeight: '600' },
})