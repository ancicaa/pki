import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changePassword } from '@/src/services/authService';

export default function ChangePasswordScreen() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [repeatPass, setRepeatPass] = useState('');
 
  const [saving, setSaving] = useState(false);

  const goBack = () => {
    console.log('back to my-profile');
    router.replace('/profile/my-profile');

  };

  const onSave = async () => {
    if (!oldPass.trim() || !newPass.trim() || !repeatPass.trim()) {
      Alert.alert('Greška', 'Popuni sva polja.');
      return;
    }
  
    if (newPass !== repeatPass) {
      Alert.alert('Greška', 'Lozinke se ne poklapaju.');
      return;
    }
  
    if (newPass.length < 6) {
      Alert.alert('Greška', 'Nova lozinka mora imati bar 6 karaktera.');
      return;
    }
  
    if (saving) return;
    setSaving(true);
  
    try {
      const raw = await AsyncStorage.getItem('currentUser');
      if (!raw) {
        Alert.alert('Greška', 'Korisnik nije pronađen.');
        return;
      }
  
      const u = JSON.parse(raw);
  
      if (u.password !== oldPass) {
        Alert.alert('Greška', 'Trenutna lozinka nije tačna.');
        return;
      }
  
      const updated = await changePassword(u.id, newPass);
  
      if (!updated) {
        Alert.alert('Greška', 'Neuspešna promena lozinke.');
        return;
      }
  
      const newUser = { ...u, ...updated };
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
  
      Alert.alert('Uspeh', 'Lozinka je uspešno promenjena.');
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Greška', 'Došlo je do problema.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Promeni lozinku</Text>

        <View style={styles.inputContainer}>
          <Entypo name="lock" size={20} color="#6B6B6B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Stara lozinka"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
            value={oldPass}
            onChangeText={setOldPass}
          />
        </View>

        <View style={styles.inputContainer}>
          <Entypo name="lock" size={20} color="#6B6B6B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nova lozinka"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
          />
        </View>

        <View style={styles.inputContainer}>
          <Entypo name="lock" size={20} color="#6B6B6B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ponovi novu lozinku"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
            value={repeatPass}
            onChangeText={setRepeatPass}
          />
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={onSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>Sačuvaj</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#5A86D6',
  },

  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 40,
    left: 16,
    zIndex: 999,
    elevation: 999,
  },

  content: {
    flex: 1,
    backgroundColor: '#E6E6E6',
    paddingHorizontal: 22,
    paddingTop: 100,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5A86D6',
    marginBottom: 28,
    textAlign: 'center',
  },

  inputContainer: {
    width: '100%',
    backgroundColor: '#F4F4F4',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    height: 56,
    marginBottom: 20,
    marginTop: 30,
  },

  inputIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },

  saveBtn: {
    marginTop: 30,
    alignSelf: 'center',
    width: 210,
    height: 54,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  saveText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
});
