import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const onPick = (choice: 'my-profile' | 'report' | 'logout') => {
    setProfileMenuOpen(false);
  
    if (choice === 'my-profile') {
      router.push('/profile/my-profile');   // ✅ bez /(tabs)
      return;
    }
  
    if (choice === 'report') {
      router.push('/profile/report-problem'); // ✅ bez /(tabs)
      return;
    }
  
    router.replace('/'); // index (login/registracija)
  };
  
  

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarStyle: { backgroundColor: '#5A86D6' },
        }}
      >
        <Tabs.Screen
          name="iznajmljivanje"
          options={{
            title: 'Iznajmljivanja',
            tabBarIcon: ({ size }) => (
              <MaterialCommunityIcons name="bike" size={size} color="white" />
            ),
          }}
        />

        <Tabs.Screen
          name="homepage"
          options={{
            title: 'Mapa',
            tabBarIcon: () => <FontAwesome5 name="map-marked-alt" size={24} color="white" />,
          }}
        />

        <Tabs.Screen
          name="qr"
          options={{
            title: 'QR',
            tabBarIcon: () => <MaterialIcons name="qr-code-scanner" size={24} color="white" />,
          }}
        />

        {/* PROFIL TAB: ne navigira, nego otvara sheet */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            //href:null,
            tabBarIcon: ({ size }) => (
              <MaterialCommunityIcons name="account" size={size} color="white" />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); 
              setProfileMenuOpen(true); 
            },
          }}
        />
      </Tabs>

      {/* GLOBAL BOTTOM SHEET (iznad bilo kog taba) */}
      <Modal
        visible={profileMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setProfileMenuOpen(false)} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Izaberi opciju</Text>

          <Pressable style={styles.row} onPress={() => onPick('my-profile')}>
            <MaterialCommunityIcons name="account" size={22} color="#111" />
            <Text style={styles.rowText}>Moj profil</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onPick('report')}>
            <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#111" />
            <Text style={styles.rowText}>Prijava problema</Text>
          </Pressable>

          <Pressable style={[styles.row, styles.logoutRow]} onPress={() => onPick('logout')}>
            <MaterialCommunityIcons name="logout" size={22} color="#D11A2A" />
            <Text style={[styles.rowText, styles.logoutText]}>Logout</Text>
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={() => setProfileMenuOpen(false)}>
            <Text style={styles.cancelText}>Otkaži</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
  },

  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#111' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowText: { marginLeft: 10, fontSize: 16, fontWeight: '600', color: '#111' },

  logoutRow: { marginTop: 6 },
  logoutText: { color: '#D11A2A' },

  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#EFEAEA',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: { fontWeight: '700', color: '#111' },
});
