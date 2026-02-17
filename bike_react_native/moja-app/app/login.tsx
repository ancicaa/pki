import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '@/src/services/authService';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';



export default function LoginScreen() {
  const router = useRouter();
  const [korisnickoIme, setKorisnickoIme] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!korisnickoIme || !lozinka) {
      Alert.alert('Greška', 'Molimo popunite sva polja');
      return;
    }

    setLoading(true);
    const result: any = await loginUser(korisnickoIme, lozinka);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/homepage');
    } else {
      Alert.alert('Greška', result.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
         <Text style={styles.backButtonText}><Ionicons name="arrow-back" size={20} color="#FFFFFF" /></Text>
        
        
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Prijavi se</Text>

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

      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Učitavanje...' : 'Prijavi se'}
        </Text>
      </TouchableOpacity>

  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5886D9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -460,
  },
  logo: {
    width: 600,
    height: 300,
  },
  title: {
    fontSize: 32,
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
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 20,
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
    color: '#3F3DE7',
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
  hint: {
    color: 'white',
    fontSize: 14,
    marginTop: 20,
    fontStyle: 'italic',
  },
  inputIcon:{
    marginRight: 12,
    fontSize: 20,
  }
});