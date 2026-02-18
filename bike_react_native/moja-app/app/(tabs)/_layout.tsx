import React, { useState } from 'react';
import { Tabs, router } from 'expo-router';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const onPick = (choice: 'my-profile' | 'report' | 'logout') => {
    setProfileMenuOpen(false);

    if (choice === 'my-profile') {
      router.push('/profile/my-profile');
      return;
    }

    if (choice === 'report') {
      router.push('/profile/report-problem');
      return;
    }

    router.replace('/');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#5A86D6',
            height: 70,
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#fff',
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 6,
            color: '#fff',
          },
        }}
      >
        {/* IZNAMLJIVANJE */}
        <Tabs.Screen
          name="iznajmljivanje"
          options={{
            title: 'Iznajmljivanje',
            tabBarIcon: ({ size, focused }) => (
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="bike"
                  size={focused ? size + 4 : size}
                  color="#fff"
                />
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.label,
                  focused && styles.labelActive,
                ]}
              >
                Iznajmljivanje
              </Text>
            ),
          }}
        />

        {/* MAPA */}
        <Tabs.Screen
          name="homepage"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ size, focused }) => (
              <View style={styles.iconWrapper}>
                <FontAwesome5
                  name="map-marked-alt"
                  size={focused ? size + 4 : size}
                  color="#fff"
                />
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.label, focused && styles.labelActive]}>
                Mapa
              </Text>
            ),
          }}
        />

        {/* QR */}
        <Tabs.Screen
          name="qr"
          options={{
            title: 'QR',
            tabBarIcon: ({ size, focused }) => (
              <View style={styles.iconWrapper}>
                <MaterialIcons
                  name="qr-code-scanner"
                  size={focused ? size + 4 : size}
                  color="#fff"
                />
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.label, focused && styles.labelActive]}>
                QR
              </Text>
            ),
          }}
        />

        {/* PROFIL */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ size, focused }) => (
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name="account"
                  size={focused ? size + 4 : size}
                  color="#fff"
                />
                {focused && <View style={styles.activeLine} />}
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={[styles.label, focused && styles.labelActive]}>
                Profil
              </Text>
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

      <Modal
        visible={profileMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setProfileMenuOpen(false)}
        />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Izaberi opciju</Text>

          <Pressable style={styles.row} onPress={() => onPick('my-profile')}>
            <MaterialCommunityIcons name="account" size={22} color="#111" />
            <Text style={styles.rowText}>Moj profil</Text>
          </Pressable>

          <Pressable style={styles.row} onPress={() => onPick('report')}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={22}
              color="#111"
            />
            <Text style={styles.rowText}>Prijava problema</Text>
          </Pressable>

          <Pressable
            style={[styles.row, styles.logoutRow]}
            onPress={() => onPick('logout')}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#D11A2A" />
            <Text style={[styles.rowText, styles.logoutText]}>
              Logout
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelBtn}
            onPress={() => setProfileMenuOpen(false)}
          >
            <Text style={styles.cancelText}>Otkaži</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  

  activeLine: {
    position: 'absolute',
    top:0,
    width: 32,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  

  label: {
    color: '#fff',
    fontSize: 12,
  },

  labelActive: {
    fontWeight: '800',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

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

  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  rowText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },

  logoutRow: {
    marginTop: 6,
  },

  logoutText: {
    color: '#D11A2A',
  },

  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#EFEAEA',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelText: {
    fontWeight: '700',
    color: '#111',
  },
});
