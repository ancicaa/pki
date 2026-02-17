import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../../../components/appHeader';
import Entypo from '@expo/vector-icons/Entypo';

export default function ChangePasswordScreen() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [repeatPass, setRepeatPass] = useState('');

  const onSave = () => {
    if (!oldPass || !newPass || !repeatPass) {
      Alert.alert('Greška', 'Popuni sva polja');
      return;
    }
    if (newPass !== repeatPass) {
      Alert.alert('Greška', 'Lozinke se ne poklapaju');
      return;
    }
    Alert.alert('Uspešno', 'Lozinka je promenjena');
    router.back();
  };

  return (
    <View style={styles.screen}>


      <View style={styles.content}>
        <Text style={styles.title}>Promeni lozinku</Text>

        <View style={styles.inputContainer}>
        <Entypo name="lock" size={22} color="black" style={styles.inputIcon} />
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
        <Entypo name="lock" size={22} color="black" style={styles.inputIcon} />
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
        <Entypo name="lock" size={22} color="black" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ponovi novu lozinku"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
            value={repeatPass}
            onChangeText={setRepeatPass}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.9}>
          <Text style={styles.saveText}>Sačuvaj</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#5A86D6' },
  content: { flex: 1, backgroundColor: '#E6E6E6', padding: 18, paddingTop: 28 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 18 },

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
  input: { flex: 1, fontSize: 16, color: '#111' },

  saveBtn: {
    marginTop: 8,
    alignSelf: 'center',
    width: 190,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  saveText: { fontSize: 18, fontWeight: '800', color: '#111' },
});
