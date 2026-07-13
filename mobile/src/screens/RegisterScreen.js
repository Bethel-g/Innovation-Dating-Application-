import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', skills: '', headline: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.skills) payload.skills = form.skills.split(',').map(s => s.trim());
      await register(payload);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Join Innovation Dating</Text>
        <Text style={styles.subtitle}>Build your professional network</Text>

        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#999" value={form.name} onChangeText={t => setForm({ ...form, name: t })} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" value={form.email} onChangeText={t => setForm({ ...form, email: t })} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone (optional)" placeholderTextColor="#999" value={form.phone} onChangeText={t => setForm({ ...form, phone: t })} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Professional Headline (e.g. Senior React Developer)" placeholderTextColor="#999" value={form.headline} onChangeText={t => setForm({ ...form, headline: t })} />
        <TextInput style={styles.input} placeholder="Skills (comma separated, e.g. React, Node.js, Python)" placeholderTextColor="#999" value={form.skills} onChangeText={t => setForm({ ...form, skills: t })} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#999" value={form.password} onChangeText={t => setForm({ ...form, password: t })} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2ff' },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 36, fontWeight: '800', textAlign: 'center', color: '#EF4444', marginBottom: 4 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#636e72', marginBottom: 40 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16,
    marginBottom: 16, borderWidth: 2, borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#EF4444', borderRadius: 12, padding: 16, alignItems: 'center',
    marginBottom: 16, marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  link: { textAlign: 'center', color: '#EF4444', fontWeight: '600', marginTop: 16 },
});
