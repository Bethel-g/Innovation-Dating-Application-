import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { matchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function HomeScreen() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState({ used: 0, max: 50 });

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    try {
      const res = await matchAPI.getPotential();
      setProfiles(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (currentIndex >= profiles.length) return;
    const profile = profiles[currentIndex];

    try {
      const res = await matchAPI.swipe({ targetUserId: profile.user._id, action });
      setCurrentIndex(prev => prev + 1);
      if (res.data.isMatch) {
        Alert.alert("It's a Match! 🎉", `You matched with ${profile.user.name}!`);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Swipe failed');
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#e94057" /></View>;
  }

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No More Profiles</Text>
        <Text style={styles.emptySubtitle}>Check back later for new matches!</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadProfiles}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>HeartSync</Text>
        <Text style={styles.swipeCount}>{swipeCount.used}/{swipeCount.max}</Text>
      </View>

      <View style={styles.card}>
        {profile.user.photos?.[0]?.url ? (
          <Image source={{ uri: profile.user.photos[0].url }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderText}>{profile.user.name?.[0]}</Text>
          </View>
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>
            {profile.user.name}, {profile.user.dateOfBirth ? new Date().getFullYear() - new Date(profile.user.dateOfBirth).getFullYear() : '?'}
          </Text>
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{profile.compatibilityScore}% Match</Text>
          </View>
          {profile.user.bio && <Text style={styles.cardBio}>{profile.user.bio}</Text>}
          <View style={styles.interests}>
            {profile.user.interests?.slice(0, 3).map(i => (
              <View key={i} style={styles.interestTag}>
                <Text style={styles.interestText}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.nopeBtn]} onPress={() => handleSwipe('pass')}>
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.superBtn]} onPress={() => handleSwipe('super_like')}>
          <Text style={styles.actionIcon}>⭐</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={() => handleSwipe('like')}>
          <Text style={styles.actionIcon}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: '#636e72', marginBottom: 24, textAlign: 'center' },
  refreshBtn: { backgroundColor: '#e94057', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  refreshBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  logo: { fontSize: 24, fontWeight: '800', color: '#e94057' },
  swipeCount: { color: '#636e72', fontSize: 14 },
  card: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  cardImage: { width: '100%', height: 350, resizeMode: 'cover' },
  cardImagePlaceholder: { width: '100%', height: 350, backgroundColor: '#e94057', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 80, color: '#fff', fontWeight: '700' },
  cardInfo: { padding: 20 },
  cardName: { fontSize: 24, fontWeight: '700' },
  matchBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8 },
  matchText: { color: '#00b894', fontWeight: '600', fontSize: 14 },
  cardBio: { color: '#636e72', marginTop: 8, lineHeight: 20 },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  interestTag: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  interestText: { fontSize: 13, color: '#2d3436' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 24 },
  actionBtn: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  actionIcon: { fontSize: 24 },
  nopeBtn: { borderWidth: 2, borderColor: '#e17055' },
  superBtn: { borderWidth: 2, borderColor: '#3498db' },
  likeBtn: { borderWidth: 2, borderColor: '#e94057' },
});
