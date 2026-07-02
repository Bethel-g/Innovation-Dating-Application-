import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

let socket = null;

export default function ChatScreen({ route, navigation }) {
  const { matchId, otherUser } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    connectSocket();
    loadMessages();
    return () => { socket?.disconnect(); };
  }, []);

  const connectSocket = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    socket = io('http://localhost:5000', { auth: { token } });

    socket.emit('join_match', matchId);

    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
  };

  const loadMessages = async () => {
    try {
      const res = await chatAPI.getMessages(matchId);
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');

    try {
      await chatAPI.sendMessage({ matchId, content });
    } catch (err) {
      console.error(err);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender?._id === user?._id || item.sender === user?._id;
    return (
      <View style={[styles.messageRow, isMine ? styles.sentRow : styles.receivedRow]}>
        <View style={[styles.bubble, isMine ? styles.sentBubble : styles.receivedBubble]}>
          <Text style={[styles.messageText, isMine && styles.sentText]}>{item.content}</Text>
          <Text style={[styles.time, isMine && styles.sentTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#e94057" /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser?.name}</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item._id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        ref={ref => { this.flatList = ref; }}
        onContentSizeChange={() => this.flatList?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={!input.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  backBtn: { fontSize: 24, color: '#e94057', marginRight: 12 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: '600' },
  messageList: { flex: 1 },
  messageListContent: { padding: 16 },
  messageRow: { marginBottom: 8 },
  sentRow: { alignItems: 'flex-end' },
  receivedRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  sentBubble: { backgroundColor: '#e94057', borderBottomRightRadius: 4 },
  receivedBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e0e0e0' },
  messageText: { fontSize: 16 },
  sentText: { color: '#fff' },
  time: { fontSize: 11, color: '#999', marginTop: 4, textAlign: 'right' },
  sentTime: { color: 'rgba(255,255,255,0.7)' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, marginRight: 12 },
  sendBtn: { backgroundColor: '#e94057', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 },
  sendText: { color: '#fff', fontWeight: '700' },
});
