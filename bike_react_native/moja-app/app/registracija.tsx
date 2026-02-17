import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '@/src/services/authService';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function RegistracijaScreen() {
  const router = useRouter();
  const [korisnickoIme, setKorisnickoIme] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [ime, setIme] = useState('');
  const [prezime, setPrezime] = useState('');
  const [telefon, setTelefon] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistracija = async () => {
    if (!korisnickoIme || !lozinka || !ime || !prezime || !telefon || !email) {
      Alert.alert('Greška', 'Molimo popunite sva polja');
      return;
    }

    if (lozinka.length < 6) {
      Alert.alert('Greška', 'Lozinka mora imati minimum 6 karaktera');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Greška', 'Unesite validnu email adresu');
      return;
    }

    setLoading(true);
    const result: any = await registerUser({
      korisnickoIme,
      lozinka,
      ime,
      prezime,
      telefon,
      email
    });
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Uspešno!', 
        `Nalog kreiran! Dobrodošli ${result.user.ime}!`,
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } else {
      Alert.alert('Greška', result.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
           </Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Registracija</Text>

      <View style={styles.inputContainer}>
      <Feather name="user" size={22} color="black" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Korisničko ime"
          placeholderTextColor="#B0B0B0"
          value={korisnickoIme}
          onChangeText={setKorisnickoIme}
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
      <Entypo name="lock" size={22} color="black" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Lozinka"
          placeholderTextColor="#B0B0B0"
          value={lozinka}
          onChangeText={setLozinka}
          secureTextEntry
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
      <Feather name="user" size={22} color="black" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Ime"
          placeholderTextColor="#B0B0B0"
          value={ime}
          onChangeText={setIme}
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
      <Feather name="user" size={22} color="black" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Prezime"
          placeholderTextColor="#B0B0B0"
          value={prezime}
          onChangeText={setPrezime}
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}><Feather name="phone" size={24} color="black" /></Text>
        <TextInput
          style={styles.input}
          placeholder="Kontakt telefon"
          placeholderTextColor="#B0B0B0"
          value={telefon}
          onChangeText={setTelefon}
          keyboardType="phone-pad"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}><Fontisto name="email" size={24} color="black" /></Text>
        <TextInput
          style={styles.input}
          placeholder="Email adresa"
          placeholderTextColor="#B0B0B0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.buttonDisabled]} 
        onPress={handleRegistracija}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Učitavanje...' : 'Registracija'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#5886D9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -260,
  },
  logo: {
    width: 600,
    height: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 80,
    marginTop: -80, 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '90%',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#3F3DE7',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 10,       // po potrebi (status bar)
    left: 10,
    padding: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});