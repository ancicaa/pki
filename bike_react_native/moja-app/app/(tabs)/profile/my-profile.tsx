import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { AppHeader } from '../../../components/appHeader';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';

export default function ProfileIndexScreen() {
  const [isEditing, setIsEditing] = useState(false);

  // mock podaci
  const [username, setUsername] = useState('anavranes');
  const [ime, setIme] = useState('Ana');
  const [prezime, setPrezime] = useState('Vraneš');
  const [telefon, setTelefon] = useState('+381 69 2494 483');
  const [email, setEmail] = useState('a.vranesss@gmail.com');

  const onPrimaryPress = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // ✅ "Sačuvaj" (mock) -> vrati u view mode
    setIsEditing(false);
  };

  return (
    <View style={styles.screen}>
      <AppHeader />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={74} color="#D6D6D6" />
            </View>
          </View>

          <Text style={styles.title}>Moj profil</Text>

          {/* Username (read-only / edit) */}
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#111" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              editable={isEditing}
              selectTextOnFocus={isEditing}
              placeholder="Korisničko ime"
              placeholderTextColor="#A9A9A9"
            />
          </View>

          {/* Promeni lozinku (uvek klikabilno, ne edit) */}
          <Pressable
            style={({ pressed }) => [styles.inputContainer, styles.passwordRow, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/profile/change-password')}
          >
            <Feather name="lock" size={20} color="#5A86D6" style={styles.inputIcon} />
            <Text style={styles.passwordText}>Promeni lozinku</Text>
          </Pressable>

          {/* Ime */}
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#111" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={ime}
              onChangeText={setIme}
              editable={isEditing}
              selectTextOnFocus={isEditing}
              placeholder="Ime"
              placeholderTextColor="#A9A9A9"
            />
          </View>

          {/* Prezime */}
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#111" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={prezime}
              onChangeText={setPrezime}
              editable={isEditing}
              selectTextOnFocus={isEditing}
              placeholder="Prezime"
              placeholderTextColor="#A9A9A9"
            />
          </View>

          {/* Telefon */}
          <View style={styles.inputContainer}>
            <Feather name="phone" size={20} color="#111" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={telefon}
              onChangeText={setTelefon}
              editable={isEditing}
              selectTextOnFocus={isEditing}
              placeholder="Telefon"
              placeholderTextColor="#A9A9A9"
              keyboardType="phone-pad"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#111" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              selectTextOnFocus={isEditing}
              placeholder="Email"
              placeholderTextColor="#A9A9A9"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Primary button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryPress} activeOpacity={0.9}>
            <Text style={styles.primaryText}>{isEditing ? 'Sačuvaj' : 'Izmeni podatke'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#5A86D6' },

  content: {
    flexGrow: 1,
    backgroundColor: '#E6E6E6',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 30,
    alignItems: 'center',
  },

  avatarWrap: { marginTop: 6, marginBottom: 10 },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#5A86D6',
    marginBottom: 18,
  },

  inputContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },

  inputIcon: { marginRight: 10 },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },

  passwordRow: {
    borderWidth: 0,
  },

  passwordText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5A86D6',
  },

  primaryBtn: {
    marginTop: 8,
    width: 190,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  primaryText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
});
