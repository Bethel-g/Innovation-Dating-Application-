import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chat } from '../services/index.js';
import { colors, s } from '../theme';

export default function ChatScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chat.conversations();
      setConversations(Array.isArray(res) ? res : []);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const openChat = async (conv) => {
    setActive(conv);
    setMessages([]);
    try {
      const res = await chat.messages(conv.match.id);
      setMessages(Array.isArray(res) ? res : []);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load messages');
    }
  };

  const send = async () => {
    if (!draft.trim() || !active) return;
    const body = { matchId: active.match.id, content: draft.trim() };
    setSending(true);
    try {
      const saved = await chat.send(body);
      setMessages(prev => [...prev, saved]);
      setDraft('');
    } catch (err) {
      Alert.alert('Send failed', err.message || 'Please try again');
    } finally {
      setSending(false);
    }
  };

  if (active) {
    const other = active.otherUser || {};
    return (
      <SafeAreaView style={s.screen}>
        <View style={[s.container, s.row, s.between]}>
          <TouchableOpacity onPress={() => setActive(null)}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[s.h2, { marginBottom: 0 }]}>{other.name || 'Match'}</Text>
          <View style={{ width: 40 }} />
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            data={messages}
            keyExtractor={(item, i) => String(item.id || i)}
            renderItem={({ item }) => (
              <View style={{ alignSelf: 'flex-start', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 8, maxWidth: '80%' }}>
                <Text style={{ color: colors.text }}>{item.content}</Text>
                <Text style={{ fontSize: 10, color: colors.textLight, marginTop: 2 }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ''}
                </Text>
              </View>
            )}
          />
          <View style={[s.row, { padding: 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message..."
              onSubmitEditing={send}
            />
            <TouchableOpacity onPress={send} disabled={sending || !draft.trim()} style={[s.primaryBtn, { paddingVertical: 12 }]}>
              <Text style={s.primaryBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.container}>
        <Text style={s.title}>Chat</Text>
        <Text style={s.subtitle}>Conversations with your matches</Text>
      </View>
      {loading ? (
        <View style={s.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : conversations.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>💬</Text>
          <Text style={s.emptyTitle}>No conversations yet</Text>
          <Text style={s.emptyText}>Match with someone on the Discover tab to start chatting.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.match.id)}
          renderItem={({ item }) => {
            const other = item.otherUser || {};
            return (
              <TouchableOpacity style={[s.card, s.row]} onPress={() => openChat(item)}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{other.name?.[0] || 'U'}</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{other.name || 'Match'}</Text>
                  <Text style={{ fontSize: 13, color: colors.textLight, numberOfLines: 1 }}>
                    {item.lastMessage ? item.lastMessage.content : 'Say hi!'}
                  </Text>
                </View>
                {item.unreadCount > 0 && (
                  <View style={{ backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{item.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}