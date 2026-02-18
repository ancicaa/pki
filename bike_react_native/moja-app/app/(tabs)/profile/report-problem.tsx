import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ReportProblemScreen() {
  const [modalVisible, setModalVisible] = useState(true);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

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

  const handleSubmit = () => {
    Keyboard.dismiss();

    if (!description.trim()) {
      Alert.alert('Greška', 'Unesite kratak opis problema.');
      return;
    }

    Alert.alert('Prijavljen problem', 'Problem je uspešno prijavljen!', [
      {
        text: 'OK',
        onPress: () => {
          setDescription('');
          setPhoto(null);
          setModalVisible(false);
          router.push('/(tabs)/homepage');
        },
      },
    ]);
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

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <Pressable style={styles.backdrop} onPress={Keyboard.dismiss} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prijavi problem</Text>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal} activeOpacity={0.8}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Kratak opis:</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
                placeholder=""
                placeholderTextColor="#A9A9A9"
              />

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

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },

  modalCard: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    maxHeight: '90%', 
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },

  closeButton: {
    position: 'absolute',
    right: 0,
    top: -6,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { fontSize: 16, color: '#555', fontWeight: '700' },

  label: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
    marginTop: 10,
    marginBottom: 8,
  },

  textInput: {
    borderWidth: 0,
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#F4F4F4',
    marginBottom: 12,
  },

  photoBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#999',
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#111',
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
  okText: { fontWeight: '800', color: '#111' },
});
