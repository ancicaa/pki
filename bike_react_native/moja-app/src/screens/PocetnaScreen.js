import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PocetnaScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>BIKE</Text>
        <Text style={styles.logoSubtext}>RENTAL</Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Prijavi se</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Registracija')}
      >
        <Text style={styles.buttonText}>Napravi profil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B8FDB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 5,
  },
  logoSubtext: {
    fontSize: 16,
    color: 'white',
    letterSpacing: 8,
    marginTop: -10,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#5B8FDB',
    fontSize: 16,
    fontWeight: 'bold',
  },
});