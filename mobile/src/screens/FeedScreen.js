import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { feed, unwrap } from '../services/index.js';
import { colors, s } from '../theme';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feed.all({ limit: 20 });
      setPosts(unwrap(res));
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const post = async () => {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      await feed.create({ content: draft.trim(), type: 'update' });
      setDraft('');
      setComposeOpen(false);
      load();
    } catch (err) {
      Alert.alert('Post failed', err.message || 'Please try again');
    } finally {
      setPosting(false);
    }
  };

  const like = async (id) => {
    try {
      await feed.like(id);
      setPosts(prev => prev.map(p => {
        if (p.id !== id) return p;
        const myReaction = p.myReaction ? null : 'like';
        return { ...p, myReaction, likeCount: (p.likeCount || 0) + (myReaction ? 1 : -1) };
      }));
    } catch { /* ignore */ }
  };

  const renderPost = ({ item }) => (
    <View style={s.card}>
      <View style={[s.row, { marginBottom: 8 }]}>
        <View style={[s.avatar, { width: 40, height: 40, borderRadius: 20 }]}>
          <Text style={s.avatarText}>{item.author?.name?.[0] || 'U'}</Text>
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>{item.author?.name || 'Unknown'}</Text>
          <Text style={{ fontSize: 11, color: colors.textLight }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Text>
        </View>
        {item.type && <Text style={[s.tag, { marginBottom: 0 }]}>{item.type}</Text>}
      </View>
      <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 8 }}>{item.content}</Text>
      <View style={s.row}>
        <TouchableOpacity onPress={() => like(item.id)} style={{ marginRight: 18 }}>
          <Text style={{ fontSize: 15, color: item.myReaction ? colors.primary : colors.textLight }}>
            {item.myReaction ? '♥' : '♡'} {item.likeCount || 0}
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, color: colors.textLight }}>💬 {item.commentCount || 0}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.screen}>
      <View style={[s.container, s.between, s.row]}>
        <View>
          <Text style={s.title}>Feed</Text>
          <Text style={s.subtitle}>Updates from your network</Text>
        </View>
        <TouchableOpacity onPress={() => setComposeOpen(true)} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : posts.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📭</Text>
          <Text style={s.emptyTitle}>Your feed is empty</Text>
          <Text style={s.emptyText}>Follow people and post updates to get started.</Text>
        </View>
      ) : (
        <FlatList data={posts} keyExtractor={(item) => String(item.id)} renderItem={renderPost} />
      )}

      <Modal visible={composeOpen} animationType="slide" transparent onRequestClose={() => setComposeOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={s.h2}>Share an update</Text>
            <TextInput
              style={[s.input, { minHeight: 100, textAlignVertical: 'top' }]}
              value={draft}
              onChangeText={setDraft}
              multiline
              placeholder="What are you working on?"
            />
            <View style={[s.row, s.between]}>
              <TouchableOpacity onPress={() => setComposeOpen(false)} style={[s.outlineBtn, { flex: 1, marginRight: 8 }]}>
                <Text style={s.outlineBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={post} style={[s.primaryBtn, { flex: 1 }]} disabled={posting}>
                <Text style={s.primaryBtnText}>{posting ? 'Posting...' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
};