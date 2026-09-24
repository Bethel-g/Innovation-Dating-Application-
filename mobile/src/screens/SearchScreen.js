import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { jobs } from '../services/index.js';
import { colors, s } from '../theme';

export default function SearchScreen() {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('people');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'jobs') {
        res = await jobs.all({ q });
      } else {
        const { api } = await import('../services/api.js');
        res = await api.get('/users/explore', { q });
      }
      setResults(Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      Alert.alert('Search failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  }, [tab, q]);

  useEffect(() => { run(); }, [run]);

  const card = (item) => {
    if (tab === 'jobs') {
      return (
        <View style={s.card}>
          <Text style={s.h2}>{item.title}</Text>
          <Text style={s.textLight}>{item.company?.name || item.location || ''}</Text>
          <View style={[s.row, s.between, { marginTop: 8 }]}>
            <Text style={s.tag}>{item.employmentType}</Text>
            {item.remote != null && <Text style={s.textLight}>{item.remote ? '🌍 Remote' : '🏢 On-site'}</Text>}
          </View>
        </View>
      );
    }
    return (
      <View style={[s.card, s.row]}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{item.name?.[0] || 'P'}</Text>
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={s.h2}>{item.name}</Text>
          <Text style={s.textLight}>{item.headline || item.role || ''}</Text>
        </View>
        <Text style={s.tag}>{item.sector || ''}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.container}>
        <Text style={s.title}>Search</Text>
        <Text style={s.subtitle}>Find people and opportunities</Text>
        <View style={[s.row, { marginBottom: 12 }]}>
          <TextInput
            style={[s.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
            value={q}
            onChangeText={setQ}
            placeholder="Search..."
          />
          <TouchableOpacity onPress={run} style={[s.primaryBtn, { paddingVertical: 12 }]}>
            <Text style={s.primaryBtnText}>Go</Text>
          </TouchableOpacity>
        </View>
        <View style={[s.row, { marginBottom: 12 }]}>
          {['people', 'jobs'].map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, { backgroundColor: tab === t ? colors.primary : colors.bg }]}
            >
              <Text style={{ color: tab === t ? '#fff' : colors.text, fontWeight: '700', textTransform: 'capitalize' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={s.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : results.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🔎</Text>
          <Text style={s.emptyTitle}>No results</Text>
          <Text style={s.emptyText}>Try a different search term.</Text>
        </View>
      ) : (
        <FlatList contentContainerStyle={{ paddingHorizontal: 16 }} data={results} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => card(item)} />
      )}
    </SafeAreaView>
  );
}

const styles = {
  tabBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, marginRight: 8 },
};