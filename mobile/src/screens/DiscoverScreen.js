import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { matches, unwrap } from '../services/index.js';
import { colors, s } from '../theme';

function Card({ item, onSwipe, onDetail }) {
  const user = item.user || item;
  const name = user.name || 'Someone';
  const score = item.compatibilityScore != null ? Math.round(item.compatibilityScore) : null;
  return (
    <View style={[s.card, { padding: 20, marginHorizontal: 16, marginTop: 12 }]}>
      <View style={[s.row, { marginBottom: 12 }]}>
        <View style={s.avatar}>
          {user.photos?.[0]?.url ? <Text>📷</Text> : <Text style={s.avatarText}>{name[0]}</Text>}
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={s.h2}>{name}</Text>
          <Text style={s.textLight}>{user.headline || user.role || 'Professional'}</Text>
        </View>
        {score != null && (
          <View style={{ backgroundColor: colors.success, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{score}%</Text>
          </View>
        )}
      </View>
      <View style={s.row}>
        <TouchableOpacity onPress={() => onDetail(user)} style={{ flex: 1 }}>
          <Text style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>View</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => onSwipe(user.id, 'pass')} style={[styles.btn, { backgroundColor: colors.bg }]}>
            <Text style={{ fontSize: 22 }}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSwipe(user.id, 'like')} style={[styles.btn, { backgroundColor: colors.primary, marginLeft: 8 }]}>
            <Text style={{ fontSize: 22 }}>♥</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function DiscoverScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await matches.potential();
      setItems(unwrap(res));
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSwipe = async (targetUserId, action) => {
    try {
      const res = await matches.swipe(targetUserId, action);
      if (res && res.isMatch) {
        Alert.alert('It’s a match! 🎉', 'You matched with someone new. Head to Chat to say hi.');
      }
      setItems(prev => prev.filter(n => (n.user ? n.user.id : n.id) !== targetUserId));
    } catch (err) {
      Alert.alert('Swipe failed', err.message || 'Please try again');
    }
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={[s.container, s.between, s.row]}>
        <View>
          <Text style={s.title}>Discover</Text>
          <Text style={s.subtitle}>People who match your skills</Text>
        </View>
        <TouchableOpacity onPress={load}><Text style={{ color: colors.primary, fontWeight: '600' }}>Refresh</Text></TouchableOpacity>
      </View>
      {loading ? (
        <View style={s.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🔍</Text>
          <Text style={s.emptyTitle}>No more profiles</Text>
          <Text style={s.emptyText}>Try again later — new matches appear as people join.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => String(i)}
          renderItem={({ item }) => (
            <Card item={item} onSwipe={onSwipe} onDetail={(u) => Alert.alert(u.name, u.headline || u.role || '')} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = { btn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' } };