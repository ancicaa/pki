import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppHeader } from '../../components/appHeader';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const BASE_URL = 'http://172.20.10.4:3000';

type SortKey = 'datum' | 'cena';
type SortDir = 'asc' | 'desc';

const parseDateTime = (datum: string, vreme: string): number => {
  const [day, month, year] = datum.replace(/\.$/, '').split('.').map(Number);
  const [hours, minutes] = vreme.split(' - ')[0].split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes).getTime();
};

export default function RentalsScreen() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('datum');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const load = async () => {
        try {
          const raw = await AsyncStorage.getItem('currentUser');
          if (!raw) { setLoading(false); return; }
          const user = JSON.parse(raw);
          const response = await fetch(
            `${BASE_URL}/iznajmljivanja?korisnik=${user.username}`
          );
          const data = await response.json();
          setRentals(data);
        } catch (error) {
          console.error('Greška:', error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedRentals = [...rentals].sort((a, b) => {
    let valA: number, valB: number;
  
    if (sortKey === 'datum') {
      valA = parseDateTime(a.datum, a.vreme);
      valB = parseDateTime(b.datum, b.vreme);
    } else {
      valA = parseFloat(a.cena);
      valB = parseFloat(b.cena);
    }
  
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  const SortButton = ({ label, icon, sortKeyVal }: { label: string; icon: string; sortKeyVal: SortKey }) => {
    const active = sortKey === sortKeyVal;
    return (
      <TouchableOpacity
        style={[styles.sortBtn, active && styles.sortBtnActive]}
        onPress={() => handleSort(sortKeyVal)}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={active ? '#fff' : '#5886D9'}
        />
        <Text style={[styles.sortBtnText, active && styles.sortBtnTextActive]}>
          {label}
        </Text>
        {active && (
          <MaterialCommunityIcons
            name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={14}
            color="#fff"
            style={{ marginLeft: 2 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#5886D9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Prethodna iznajmljivanja</Text>

        {rentals.length > 0 && (
          <View style={styles.sortRow}>
            <SortButton label="Datum" icon="calendar-clock" sortKeyVal="datum" />
            <SortButton label="Cena" icon="cash" sortKeyVal="cena" />
          </View>
        )}

        {rentals.length === 0 ? (
          <Text style={styles.empty}>Nemate prethodnih iznajmljivanja.</Text>
        ) : (
          <FlatList
            data={sortedRentals}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.row}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color="#000" />
                  <Text style={styles.rowText}>
                    {item.datum} {item.vreme}
                  </Text>
                </View>

                <View style={styles.row}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#000" />
                  <Text style={styles.rowText}>{item.minuta} minuta</Text>
                </View>

                <View style={styles.row}>
                  <MaterialCommunityIcons name="cash" size={20} color="#000" />
                  <Text style={styles.rowText}>{item.cena} RSD</Text>
                </View>

                <Text style={styles.idText}>#{item.bikeId}</Text>
              </View>
            )}
          />
        )}
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
    color: '#000000',
    marginBottom: 12,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#5886D9',
    backgroundColor: '#fff',
    gap: 4,
  },
  sortBtnActive: {
    backgroundColor: '#5886D9',
    borderColor: '#5886D9',
  },
  sortBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5886D9',
  },
  sortBtnTextActive: {
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
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