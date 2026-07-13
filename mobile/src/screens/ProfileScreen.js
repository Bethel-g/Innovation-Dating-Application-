import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          {user?.photos?.[0]?.url ? (
            <Image source={{ uri: user.photos[0].url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{user?.name?.[0]}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        {user?.headline && <Text style={styles.headline}>{user.headline}</Text>}
      </View>

      {user?.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>
      )}

      {user?.skills?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagContainer}>
            {user.skills.map(s => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {user?.experience?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {user.experience.map((exp, i) => (
            <View key={i} style={styles.expItem}>
              <Text style={styles.expRole}>{exp.role}</Text>
              <Text style={styles.expCompany}>{exp.company}</Text>
              {exp.duration && <Text style={styles.expDuration}>{exp.duration}</Text>}
            </View>
          ))}
        </View>
      )}

      {user?.intents?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <View style={styles.tagContainer}>
            {user.intents.map(t => (
              <View key={t} style={[styles.tag, styles.intentTag]}>
                <Text style={[styles.tagText, styles.intentText]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {user?.interests?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagContainer}>
            {user.interests.map(i => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.info}>📧 {user?.email}</Text>
        <Text style={styles.info}>💎 {user?.subscriptionTier?.toUpperCase()}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff' },
  avatarWrapper: { marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 36, color: '#fff', fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700' },
  headline: { fontSize: 15, color: '#EF4444', marginTop: 4, fontWeight: '500' },
  section: { backgroundColor: '#fff', marginTop: 12, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#2d3436' },
  bio: { color: '#636e72', lineHeight: 22 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#eef0ff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 14, color: '#F97316' },
  intentTag: { backgroundColor: '#e8f5e9' },
  intentText: { color: '#00b894' },
  expItem: { marginBottom: 12 },
  expRole: { fontSize: 15, fontWeight: '600', color: '#2d3436' },
  expCompany: { fontSize: 14, color: '#636e72', marginTop: 2 },
  expDuration: { fontSize: 13, color: '#999', marginTop: 2 },
  info: { fontSize: 15, color: '#636e72', marginBottom: 8 },
  logoutBtn: { marginHorizontal: 20, marginTop: 24, marginBottom: 40, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#e17055' },
  logoutText: { color: '#e17055', fontWeight: '700', fontSize: 16 },
});
