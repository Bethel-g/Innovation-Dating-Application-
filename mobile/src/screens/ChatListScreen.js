import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChatListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#e94057" /></View>;
  }

  const renderItem = ({ item }) => {
    const otherUser = item.otherUser;
    return (
      <TouchableOpacity style={styles.conversation} onPress={() => navigation.navigate('Chat', { matchId: item.match._id, otherUser })}>
        <View style={styles.avatar}>
          {otherUser?.photos?.[0]?.url ? (
            <Image source={{ uri: otherUser.photos[0].url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{otherUser?.name?.[0]}</Text>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{otherUser?.name}</Text>
          <Text style={styles.lastMessage}>
            {item.lastMessage ? item.lastMessage.content.substring(0, 40) : 'Start chatting!'}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unread}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Messages</Text>
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No conversations</Text>
          <Text style={styles.emptySub}>Match with someone to start chatting!</Text>
        </View>
      ) : (
        <FlatList data={conversations} renderItem={renderItem} keyExtractor={item => item.match._id} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 28, fontWeight: '700', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  emptySub: { color: '#636e72' },
  conversation: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#e94057', justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  lastMessage: { color: '#636e72', fontSize: 14, marginTop: 2 },
  unread: { backgroundColor: '#e94057', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
