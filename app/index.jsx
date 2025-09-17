import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'


export default function Home() {
const router = useRouter()


return (
<SafeAreaView style={styles.safe}>
<View style={styles.container}>
<Text style={styles.brand}>TaskMate</Text>


<Text style={styles.tagline}>Plan less. Do more.</Text>


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
</View>
</SafeAreaView>
)
}


const styles = StyleSheet.create({
safe: {
flex: 1,
backgroundColor: '#fefbf6',
},
container: {
flex: 1,
alignItems: 'center',
justifyContent: 'center',
padding: 24,
backgroundColor: '#fefbf6',
},
brand: {
fontSize: 34,
marginBottom: 12,
color: '#5d5a88',
fontWeight: '700',
},
tagline: {
fontSize: 16,
marginBottom: 48,
color: '#7b7b7b',
},
primary: {
width: '75%',
padding: 16,
backgroundColor: '#a8dadc',
borderRadius: 14,
alignItems: 'center',
marginBottom: 16,
shadowColor: '#000',
shadowOpacity: 0.1,
shadowOffset: { width: 0, height: 2 },
shadowRadius: 4,
elevation: 2,
},
primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
secondary: {
width: '75%',
padding: 16,
borderRadius: 14,
alignItems: 'center',
borderWidth: 1,
borderColor: '#a8dadc',
backgroundColor: '#fff',
},
secondaryText: { color: '#5d5a88', fontSize: 16, fontWeight: '600' },
})