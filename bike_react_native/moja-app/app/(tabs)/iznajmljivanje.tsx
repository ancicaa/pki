import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppHeader } from '../../components/appHeader';

// MOCK PODACI
const MOCK_RENTALS = [
  {
    id: '#2362',
    date: '17.01.2026.',
    time: '10:14 - 10:21',
    duration: '7 minuta',
    price: '84 RSD',
  },
  {
    id: '#1262',
    date: '16.01.2026.',
    time: '20:52 - 21:03',
    duration: '11 minuta',
    price: '110 RSD',
  },
  {
    id: '#1225',
    date: '16.01.2026.',
    time: '08:10 - 08:34',
    duration: '24 minuta',
    price: '384 RSD',
  },
  {
    id: '#1189',
    date: '14.01.2026.',
    time: '12:36 - 12:41',
    duration: '5 minuta',
    price: '62 RSD',
  },
  {
    id: '#1002',
    date: '08.01.2026.',
    time: '23:36 - 23:41',
    duration: '5 minuta',
    price: '62 RSD',
  },
];

export default function RentalsScreen() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <AppHeader />

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Prethodna iznajmljivanja</Text>

        <FlatList
          data={MOCK_RENTALS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Datum */}
              <View style={styles.row}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={20}
                  color="#000"
                />
                <Text style={styles.rowText}>
                  {item.date} {item.time}
                </Text>
              </View>

              {/* Trajanje */}
              <View style={styles.row}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#000"
                />
                <Text style={styles.rowText}>{item.duration}</Text>
              </View>

              {/* Cena */}
              <View style={styles.row}>
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
                  color="#000"
                />
                <Text style={styles.rowText}>{item.price}</Text>
              </View>

              {/* ID */}
              <Text style={styles.idText}>{item.id}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6', 
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  sectionTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  rowText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  idText: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontWeight: '700',
    color: '#000',
  },
});
