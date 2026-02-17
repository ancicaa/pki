import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QrScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Skener</Text>
      <Text style={styles.text}>Ovde ide kamera i skeniranje QR koda (za sad mock ekran).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  text: { fontSize: 16, color: '#333' },
});
