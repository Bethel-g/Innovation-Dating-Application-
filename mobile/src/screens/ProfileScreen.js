import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, s } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const fields = user
    ? [
        ['Name', user.name],
        ['Email', user.email],
        ['Headline', user.headline],
        ['Role', user.role],
        ['Sector', user.sector],
        ['Location', user.locationCity ? `${user.locationCity}${user.locationCountry ? ', ' + user.locationCountry : ''}` : ''],
      ]
    : [];

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Profile</Text>
        <Text style={s.subtitle}>Your innovation profile</Text>

        <View style={[s.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <View style={[s.avatar, { width: 80, height: 80, borderRadius: 40 }]}>
            <Text style={[s.avatarText, { fontSize: 30 }]}>{user?.name?.[0] || 'U'}</Text>
          </View>
          <Text style={[s.h2, { marginTop: 10 }]}>{user?.name || 'User'}</Text>
          <Text style={s.textLight}>{user?.headline || user?.role || ''}</Text>
        </View>

        {fields.map(([label, value]) =>
          value ? (
            <View key={label} style={[s.card, s.row, s.between]}>
              <Text style={{ color: colors.textLight, fontWeight: '600' }}>{label}</Text>
              <Text style={{ color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' }}>{value}</Text>
            </View>
          ) : null
        )}

        <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { marginTop: 16 }]}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  logoutBtn: { backgroundColor: colors.danger, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
};