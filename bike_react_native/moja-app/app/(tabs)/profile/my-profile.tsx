import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AppHeader } from '../../../components/appHeader';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://172.20.10.4:3000';

type User = {
  id?: number | string;
  username?: string;
  ime?: string;
  prezime?: string;
  telefon?: string;
  email?: string;
};

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const cleanPhone = (v: string) => v.replace(/[^\d+]/g, '').trim();

export default function ProfileIndexScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // trenutni user (iz storage-a)
  const [user, setUser] = useState<User | null>(null);

  // form polja
  const [username, setUsername] = useState('');
  const [ime, setIme] = useState('');
  const [prezime, setPrezime] = useState('');
  const [telefon, setTelefon] = useState('');
  const [email, setEmail] = useState('');

  // da možemo da “vratimo” ako korisnik odustane
  const initialSnapshotRef = useRef<User | null>(null);

  const hydrateFromUser = (u: User) => {
    setUsername(u.username ?? '');
    setIme(u.ime ?? '');
    setPrezime(u.prezime ?? '');
    setTelefon(u.telefon ?? '');
    setEmail(u.email ?? '');
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('currentUser');
      if (!raw) {
        setUser(null);
        setLoading(false);
        return;
      }

      const u: User = JSON.parse(raw);
      setUser(u);
      hydrateFromUser(u);
      initialSnapshotRef.current = u;
    } catch (e) {
      console.error('loadProfile error:', e);
      Alert.alert('Greška', 'Ne mogu da učitam profil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const validate = () => {
    if (!username.trim()) return 'Korisničko ime je obavezno.';
    if (!ime.trim()) return 'Ime je obavezno.';
    if (!prezime.trim()) return 'Prezime je obavezno.';
    if (!email.trim()) return 'Email je obavezan.';
    if (!isValidEmail(email)) return 'Email nije u dobrom formatu.';
    if (telefon.trim() && cleanPhone(telefon).length < 8) return 'Telefon nije u dobrom formatu.';
    return null;
  };

  const saveProfile = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Provera', err);
      return;
    }

    if (!user?.id) {
      // ako nema id, i dalje možemo samo da snimimo u AsyncStorage
      const updatedLocal: User = {
        ...(user ?? {}),
        username: username.trim(),
        ime: ime.trim(),
        prezime: prezime.trim(),
        telefon: telefon.trim(),
        email: email.trim().toLowerCase(),
      };
      setUser(updatedLocal);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedLocal));
      initialSnapshotRef.current = updatedLocal;
      setIsEditing(false);
      Alert.alert('Sačuvano', 'Profil je ažuriran.');
      return;
    }

    setSaving(true);
    try {
      const payload: User = {
        username: username.trim(),
        ime: ime.trim(),
        prezime: prezime.trim(),
        telefon: telefon.trim(),
        email: email.trim().toLowerCase(),
      };

    
      const res = await fetch(`${BASE_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Save failed: ${res.status} ${text}`);
      }

      const updatedFromServer = await res.json();

      // ✅ update local storage da ostatak app-a koristi sveže podatke
      const updatedLocal: User = { ...user, ...updatedFromServer };
      setUser(updatedLocal);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedLocal));
      initialSnapshotRef.current = updatedLocal;

      setIsEditing(false);
      Alert.alert('Sačuvano', 'Profil je ažuriran.');
    } catch (e) {
      console.error('saveProfile error:', e);
      Alert.alert('Greška', 'Nisam uspela da sačuvam izmene.');
    } finally {
      setSaving(false);
    }
  };

  const onPrimaryPress = () => {
    if (!isEditing) {
      // ulazak u edit
      initialSnapshotRef.current = user
        ? { ...user }
        : {
            username,
            ime,
            prezime,
            telefon,
            email,
          };
      setIsEditing(true);
      return;
    }

    // save
    saveProfile();
  };

  const onCancelEdit = () => {
    const snap = initialSnapshotRef.current;
    if (snap) {
      hydrateFromUser(snap);
      setUser(snap);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <AppHeader />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={{ marginTop: 10, color: '#fff', fontWeight: '700' }}>Učitavam profil…</Text>
        </View>
      </View>
    );
  }

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

          {/* Username */}
          <View style={[styles.inputContainer, !isEditing && styles.locked]}>
            <Feather name="user" size={20} color="#111" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              editable={isEditing}
              selectTextOnFocus={isEditing}
              placeholder="Korisničko ime"
              placeholderTextColor="#A9A9A9"
              autoCapitalize="none"
            />
          </View>

          {/* Promeni lozinku */}
          <Pressable
            style={({ pressed }) => [styles.inputContainer, styles.passwordRow, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/profile/change-password')}
          >
            <Feather name="lock" size={20} color="#5A86D6" style={styles.inputIcon} />
            <Text style={styles.passwordText}>Promeni lozinku</Text>
          </Pressable>

          {/* Ime */}
          <View style={[styles.inputContainer, !isEditing && styles.locked]}>
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
          <View style={[styles.inputContainer, !isEditing && styles.locked]}>
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
          <View style={[styles.inputContainer, !isEditing && styles.locked]}>
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
          <View style={[styles.inputContainer, !isEditing && styles.locked]}>
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

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
            onPress={onPrimaryPress}
            activeOpacity={0.9}
            disabled={saving}
          >
            <Text style={styles.primaryText}>
              {saving ? 'Čuvam…' : isEditing ? 'Sačuvaj' : 'Izmeni podatke'}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={onCancelEdit} activeOpacity={0.85} disabled={saving}>
              <Text style={styles.secondaryText}>Otkaži</Text>
            </TouchableOpacity>
          )}
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

  locked: {
    opacity: 0.92,
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

  secondaryBtn: {
    marginTop: 10,
    width: 190,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
});