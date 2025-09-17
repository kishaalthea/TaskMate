import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'


export default function Signup() {
const router = useRouter()
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)


const handleSignup = async () => {
if (!email || !password || !name) return Alert.alert('All fields are required')
setLoading(true)
try {
const raw = await AsyncStorage.getItem('users')
const users = raw ? JSON.parse(raw) : []
if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
setLoading(false)
return Alert.alert('Email already registered')
}
const newUser = { id: Date.now().toString(), name, email, password }
users.push(newUser)
await AsyncStorage.setItem('users', JSON.stringify(users))
await AsyncStorage.setItem('currentUser', JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email }))
setLoading(false)
Alert.alert('Success', 'Account created', [ { text: 'OK', onPress: () => router.replace('/goals') } ])
} catch (err) {
setLoading(false)
Alert.alert('Error', 'Could not create account')
}
}


return (
<SafeAreaView style={s.safe}>
<View style={s.container}>
<Text style={s.title}>Create an account</Text>


<TextInput placeholder="Full name" value={name} onChangeText={setName} style={s.input} />
<TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={s.input} />
<TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={s.input} />


<TouchableOpacity style={s.button} onPress={handleSignup} disabled={loading}>
<Text style={s.buttonText}>{loading ? 'Creating...' : 'Sign up'}</Text>
</TouchableOpacity>


<TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 12 }}>
<Text style={{ color: '#5d5a88' }}>Already have an account? Log in</Text>
</TouchableOpacity>
</View>
</SafeAreaView>
)
}


const s = StyleSheet.create({
safe: { flex: 1, backgroundColor: '#fefbf6' },
container: { flex: 1, padding: 24, justifyContent: 'center' },
title: { fontSize: 22, marginBottom: 18, textAlign: 'center', color: '#5d5a88', fontWeight: '600' },
input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 12, backgroundColor: '#fff' },
button: { backgroundColor: '#a8dadc', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
buttonText: { color: '#fff', fontWeight: '600' },
})