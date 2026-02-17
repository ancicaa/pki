import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';

import { AppHeader } from '../../components/appHeader';
import { MOCK_PINS, MapPin } from '../../src/data/mockPins';

const INITIAL_REGION: Region = {
  latitude: 44.8055,
  longitude: 20.4695,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function HomeMapScreen() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [showBikes, setShowBikes] = useState(true);
  const [showParking, setShowParking] = useState(true);

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const filteredPins = useMemo(() => {
    return MOCK_PINS.filter((p) => {
      if (p.type === 'bike') return showBikes;
      if (p.type === 'parking') return showParking;
      return true;
    });
  }, [showBikes, showParking]);

  const selectedPin = useMemo(() => {
    if (!selectedPinId) return null;
    return filteredPins.find((p) => p.id === selectedPinId) ?? null;
  }, [selectedPinId, filteredPins]);

  const isBikeSelected = selectedPin?.type === 'bike';
  const bikeInfo = isBikeSelected ? selectedPin?.bikeInfo : undefined;


  const isParkingSelected = selectedPin?.type === 'parking';
  const parkingInfo = isParkingSelected ? selectedPin?.parkingInfo : undefined;

  const shouldDim = !!selectedPinId; // potamni za oba tipa


  const handleMapPress = (e: MapPressEvent) => {
    // Ako je klik bio na marker, nemoj odmah zatvarati selekciju
    if (e?.nativeEvent?.action === 'marker-press') return;
    setSelectedPinId(null);
    setFilterOpen(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader onFilterPress={() => setFilterOpen((v) => !v)} />

      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          onPress={handleMapPress}
        >
          {filteredPins.map((p: MapPin) => {
            const isSelected = p.id === selectedPinId;

            const pinColor = p.type === 'bike' ? '#FF4D3F' : '#2F6BFF';
            const size = isSelected ? 46 : 36;

            return (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                onPress={() => setSelectedPinId(p.id)}
                tracksViewChanges={isSelected}
              >
                <View style={{ alignItems: 'center' }}>
                  {/* label badge (npr 100) */}
                  {p.label ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{p.label}</Text>
                    </View>
                  ) : null}

                  {/* pin */}
                  <Entypo
                    name="location-pin"
                    size={size}
                    color={pinColor}
                    style={{
                      // mala senka kad je selektovan
                      opacity: isSelected ? 0.95 : 1,
                    }}
                  />
                </View>
              </Marker>

            );
          })}
        </MapView>

        {/* potamnjenje */}
        {shouldDim && <View pointerEvents="none" style={styles.dimOverlay} />}


        {/* LEGENDA */}
        <View style={styles.legendCard}>
          <View style={styles.legendRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#FF4D3F" />
            <Text style={styles.legendText}>Bicikl</Text>
          </View>

          <View style={styles.legendRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#2F6BFF" />
            <Text style={styles.legendText}>Parking mesto</Text>
          </View>
        </View>

        {/* FILTER POPUP */}
        {filterOpen && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Pressable style={styles.backdrop} onPress={() => setFilterOpen(false)} />

            <View style={styles.filterCard}>
              <Pressable style={styles.filterRow} onPress={() => setShowBikes((v) => !v)}>
                <MaterialCommunityIcons
                  name={showBikes ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color="#111"
                />
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color="#FF4D3F"
                  style={styles.markerIcon}
                />
                <Text style={styles.filterText}>Bicikl</Text>
              </Pressable>

              <Pressable style={styles.filterRow} onPress={() => setShowParking((v) => !v)}>
                <MaterialCommunityIcons
                  name={showParking ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color="#111"
                />
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color="#2F6BFF"
                  style={styles.markerIcon}
                />
                <Text style={styles.filterText}>Parking mesto</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* BIKE INFO KARTICA */}
        {isBikeSelected && bikeInfo && (
          <View style={styles.bikeCard}>
            <View style={styles.bikeRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#111" />
              <Text style={styles.bikeText}>Adresa: {bikeInfo.address}</Text>
            </View>

            <View style={styles.bikeRow}>
              <MaterialCommunityIcons name="bicycle" size={18} color="#111" />
              <Text style={styles.bikeText}>Tip: {bikeInfo.bikeType} bicikl</Text>
            </View>

            <View style={styles.bikeRow}>
              <MaterialCommunityIcons name="cash" size={18} color="#111" />
              <Text style={styles.bikeText}>Cena: {bikeInfo.pricePerMinute} RSD po minutu</Text>
            </View>

            <View style={styles.bikeRow}>
              <MaterialCommunityIcons name="battery" size={18} color="#111" />
              <Text style={styles.bikeText}>Baterija: {bikeInfo.battery}%</Text>
            </View>
          </View>
        )}

        {isParkingSelected && parkingInfo && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#111" />
              <Text style={styles.infoText}>Adresa: {parkingInfo.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={18} color="#111" />
              <Text style={styles.infoText}>Udaljenost: {parkingInfo.distanceMeters}m</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5A86D6',
  },

  mapWrapper: {
    flex: 1,
    position: 'relative',
  },

  map: {
    flex: 1,
  },

  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 5,
  },

  // legenda
  legendCard: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    zIndex: 10,
    elevation: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendText: { marginLeft: 8, color: '#111', fontSize: 16 },

  // badge (100)
  badge: {
    backgroundColor: '#FFD24A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#111',
    marginBottom: 2,
  },
  badgeText: { fontWeight: '800', color: '#111', fontSize: 12 },


  // filter overlay
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  filterCard: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  markerIcon: { marginLeft: 10, marginRight: 8 },
  filterText: { fontSize: 16, color: '#111' },

  // bike info card
  bikeCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    zIndex: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  bikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bikeText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  infoCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    zIndex: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  
});
