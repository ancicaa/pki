import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createProblemReport } from '../../../src/services/mapService';

const pad2 = (n: number) => String(n).padStart(2, '0');
const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}.`;
};

export default function ReportProblemScreen() {
  const [modalVisible, setModalVisible] = useState(true);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // ✅ user unosi BikeId
  const [bikeIdInput, setBikeIdInput] = useState('');

  // ✅ opcionalno: ako imaš aktivni bajs u storage-u (može da posluži kao hint ili autofill)
  const [activeBikeTag, setActiveBikeTag] = useState<string | null>(null);

  useEffect(() => {
    const loadActiveBike = async () => {
      const bike = await AsyncStorage.getItem('activeBikeTag');
      if (bike) {
        setActiveBikeTag(bike);
        // ako želiš autofill kada postoji aktivna vožnja:
        // setBikeIdInput(String(bike));
      }
    };
    loadActiveBike();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Greška', 'Potrebna je dozvola za pristup galeriji.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      Keyboard.dismiss();
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    const bikeStr = (bikeIdInput || activeBikeTag || '').toString().trim();

    if (!bikeStr) {
      Alert.alert('Greška', 'Unesi BikeId bicikla.');
      return;
    }

    const bikeId = Number(bikeStr);
    if (!Number.isFinite(bikeId) || bikeId <= 0) {
      Alert.alert('Greška', 'BikeId mora biti pozitivan broj.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Greška', 'Unesite kratak opis problema.');
      return;
    }

    // korisnik iz storage
    let korisnik = 'unknown';
    let userId: number | string | null = null;
    try {
      const raw = await AsyncStorage.getItem('currentUser');
      if (raw) {
        const u = JSON.parse(raw);
        korisnik = u?.username ?? u?.korisnik ?? 'unknown';
        userId = u?.id ?? u?._id ?? null;
      }
    } catch {}

    // ⚠️ json-server ne podržava pravi upload; čuvamo uri ili prazno
    const fotografija = photo ?? '';

    const payload: any = {
      datum: formatDate(Date.now()),
      korisnik,
      bikeId,
      opis: description.trim(),
      fotografija:'/images/problem2.png',
      status: 'Novo',
    };

    if (userId != null) payload.userId = userId;

    const saved = await createProblemReport(payload);

    if (!saved) {
      Alert.alert('Greška', 'Neuspešno snimanje prijave. Pokušaj ponovo.');
      return;
    }

    Alert.alert(
      'Prijavljen problem',
      `Problem za bicikl #${bikeId} je uspešno prijavljen!`,
      [
        {
          text: 'OK',
          onPress: () => {
            setDescription('');
            setPhoto(null);
            setBikeIdInput('');
            setModalVisible(false);
            router.push('/(tabs)/homepage');
          },
        },
      ]
    );
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    router.push('/(tabs)/homepage');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <View style={styles.backgroundOverlay} />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.backdrop} onPress={Keyboard.dismiss} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prijavi problem</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* BICIKL */}
              <Text style={styles.label}>Bicikl (unesi ID):</Text>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="bike" size={20} color="#111" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={bikeIdInput}
                  onChangeText={(t) => setBikeIdInput(t.replace(/[^\d]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="npr. 5"
                  placeholderTextColor="#A9A9A9"
                />
              </View>

              {activeBikeTag ? (
                <Text style={styles.hintText}>Aktivna vožnja detektovana: #{activeBikeTag}</Text>
              ) : null}

              {/* OPIS */}
              <Text style={styles.label}>Kratak opis:</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
                placeholder="npr. polomljeno svetlo, probušena guma..."
                placeholderTextColor="#A9A9A9"
              />

              {/* FOTO */}
              <Text style={styles.label}>Dodaj fotografiju:</Text>
              <TouchableOpacity
                style={[styles.photoBox, photo && styles.photoBoxDone]}
                onPress={handlePickImage}
                activeOpacity={0.85}
              >
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.previewImage} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera" size={44} color="#111" />
                    <Text style={styles.photoText}>Dodaj fotografiju</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.okBtn} onPress={handleSubmit} activeOpacity={0.85}>
                <Text style={styles.okText}>OK</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  backdrop: { ...StyleSheet.absoluteFillObject },

  modalCard: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    elevation: 10,
    maxHeight: '90%',
  },

  modalHeader: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },

  closeButton: {
    position: 'absolute',
    right: 0,
    top: -6,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: { fontSize: 16, color: '#555', fontWeight: '700' },

  label: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    color: '#111',
  },

  inputContainer: {
    width: '100%',
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 10,
  },

  inputIcon: { marginRight: 10 },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },

  hintText: {
    marginTop: 0,
    marginBottom: 10,
    color: '#666',
    fontWeight: '600',
  },

  textInput: {
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    backgroundColor: '#F4F4F4',
    marginBottom: 12,
  },

  photoBox: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#999',
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F6F6F6',
    overflow: 'hidden',
  },

  photoBoxDone: {
    borderColor: '#2ecc71',
    backgroundColor: '#ECF9F0',
  },

  photoText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
  },

  previewImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },

  okBtn: {
    alignSelf: 'center',
    width: 120,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#EFEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  okText: { fontWeight: '800' },
});