import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, s } from '../theme';

const ROLES = ['technical_builder', 'ecosystem_builder', 'domain_expert', 'investor', 'user'];
const SECTORS = ['healthcare', 'education', 'fintech', 'agritech', 'ai_ml', 'cleantech', 'climate', 'edtech', 'other'];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'technical_builder', sector: 'ai_ml' });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      Alert.alert('Missing details', 'Name, email and a 6+ character password are required.');
      return;
    }
    setBusy(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Registration failed', err.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <Text style={s.title}>Join Innovation Dating</Text>
          <Text style={s.subtitle}>Find collaborators, mentors and co-founders</Text>

          <Text style={s.inputLabel}>Full Name</Text>
          <TextInput style={s.input} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="Jane Doe" />
          <Text style={s.inputLabel}>Email</Text>
          <TextInput style={s.input} value={form.email} onChangeText={v => setForm({ ...form, email: v })} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
          <Text style={s.inputLabel}>Password</Text>
          <TextInput style={s.input} value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry placeholder="At least 6 characters" />
          <Text style={s.inputLabel}>Role</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
            {ROLES.map(r => (
              <TouchableOpacity key={r} onPress={() => setForm({ ...form, role: r })}
                style={[styles.chip, { backgroundColor: form.role === r ? colors.primary : colors.bg }]}>
                <Text style={{ color: form.role === r ? '#fff' : colors.text, fontWeight: '600' }}>{r.replace(/_/g, ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.inputLabel}>Sector</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
            {SECTORS.map(sct => (
              <TouchableOpacity key={sct} onPress={() => setForm({ ...form, sector: sct })}
                style={[styles.chip, { backgroundColor: form.sector === sct ? colors.secondary : colors.bg }]}>
                <Text style={{ color: form.sector === sct ? '#fff' : colors.text, fontWeight: '600' }}>{sct}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={submit} disabled={busy}>
            <Text style={s.primaryBtnText}>{busy ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = { chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginRight: 8, marginBottom: 8 } };