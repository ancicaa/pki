import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Alert, Image } from 'react-native';
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import * as ImagePicker from 'expo-image-picker';

import { AppHeader } from '../../components/appHeader';
import { MOCK_PINS, MapPin } from '../../src/data/mockPins';

import { useLocalSearchParams, router } from 'expo-router';

const INITIAL_REGION: Region = {
  latitude: 44.8055,
  longitude: 20.4695,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

type EndFlow = 'none' | 'photo' | 'done';

const formatElapsed = (totalSec: number) => {
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

// naplata: zaokruži minute naviše, ali minimum 1 minut kad krene
const billedMinutes = (totalSec: number) => Math.max(1, Math.ceil(totalSec / 60));

export default function HomeMapScreen() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [showBikes, setShowBikes] = useState(true);
  const [showParking, setShowParking] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const { startRide } = useLocalSearchParams();

  const [rideActive, setRideActive] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [elapsed, setElapsed] = useState('00:00');

  // cena po min
  const [pricePerMinute, setPricePerMinute] = useState(12);

  const [bikeTag, setBikeTag] = useState(2325); // #2325

  const [showStartSuccess, setShowStartSuccess] = useState(false);

  // END FLOW
  const [endFlow, setEndFlow] = useState<EndFlow>('none');


  const [rideEndPhoto, setRideEndPhoto] = useState<string | null>(null);

  // final summary
  const [finalElapsed, setFinalElapsed] = useState('00:00');
  const [finalPrice, setFinalPrice] = useState(0);
  const [finalBikeTag, setFinalBikeTag] = useState(0);

  const totalPriceRsd = useMemo(() => {
    const mins = billedMinutes(elapsedSec);
    return mins * pricePerMinute;
  }, [elapsedSec, pricePerMinute]);


  useEffect(() => {
    if (startRide === 'true') {
      setRideActive(true);
      const now = Date.now();
      setStartedAt(now);

      setElapsedSec(0);
      setElapsed('00:00');

      setPricePerMinute(12);
      setBikeTag(2325);

      setShowStartSuccess(true);

      router.replace('/(tabs)/homepage');
    }
  }, [startRide]);

  // timer
  useEffect(() => {
    if (!rideActive || !startedAt) return;

    const t = setInterval(() => {
      const diffSec = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedSec(diffSec);
      setElapsed(formatElapsed(diffSec));
    }, 500);

    return () => clearInterval(t);
  }, [rideActive, startedAt]);

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

  const shouldDim = !!selectedPinId;

  const handleMapPress = (e: MapPressEvent) => {
    if (e?.nativeEvent?.action === 'marker-press') return;
    setSelectedPinId(null);
    setFilterOpen(false);
  };

  const pickRideEndPhoto = async () => {
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
      setRideEndPhoto(result.assets[0].uri);
    }
  };

  const onStopRidePress = () => {
    const finalSec = elapsedSec;
    const finalElapsedStr = formatElapsed(finalSec);
    const finalMins = billedMinutes(finalSec);
    const finalTotal = finalMins * pricePerMinute;

    setFinalElapsed(finalElapsedStr);
    setFinalPrice(finalTotal);
    setFinalBikeTag(bikeTag);

    setRideActive(false);
    setStartedAt(null);

    setRideEndPhoto(null);
    setEndFlow('photo');
  };

  const resetRide = () => {
    setElapsedSec(0);
    setElapsed('00:00');
    setPricePerMinute(12);
    setBikeTag(2325);
    setRideEndPhoto(null);
  };

  const onPhotoOk = () => {
    if (!rideEndPhoto) {
      Alert.alert('Greška', 'Molimo dodaj fotografiju bicikla.');
      return;
    }
    setEndFlow('done');
  };

  const onFinishOk = () => {
    setEndFlow('none');
    resetRide();
    router.replace(`/(tabs)/homepage?qrReset=${Date.now()}`);
    setTimeout(() => router.replace('/(tabs)/homepage'), 0);
  };

  return (
    <View style={styles.container}>
      <AppHeader onFilterPress={() => setFilterOpen((v) => !v)} />

      <View style={styles.mapWrapper}>
        <MapView style={styles.map} initialRegion={INITIAL_REGION} onPress={handleMapPress}>
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
                  {p.label ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{p.label}</Text>
                    </View>
                  ) : null}

                  <Entypo name="location-pin" size={size} color={pinColor} style={{ opacity: isSelected ? 0.95 : 1 }} />
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Ride HUD */}
        {rideActive && (
          <View style={styles.rideHud}>
            <View style={styles.rideTopRow}>
              <View style={styles.metric}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#111" />
                <Text style={styles.metricText}>{elapsed}</Text>
              </View>

              <View style={styles.metric}>
                <MaterialCommunityIcons name="cash" size={26} color="#111" />
                <Text style={styles.metricText}>{totalPriceRsd} RSD</Text>
              </View>

              <View style={styles.metric}>
                <MaterialCommunityIcons name="bike" size={26} color="#111" />
                <Text style={styles.metricText}>#{bikeTag}</Text>
              </View>
            </View>

            <View style={styles.rideBottomRow}>
              <Pressable style={styles.stopBtn} onPress={onStopRidePress}>
                <Text style={styles.stopBtnText}>Završi vožnju</Text>
              </Pressable>
            </View>
          </View>
        )}

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
                <MaterialCommunityIcons name="map-marker" size={18} color="#FF4D3F" style={styles.markerIcon} />
                <Text style={styles.filterText}>Bicikl</Text>
              </Pressable>

              <Pressable style={styles.filterRow} onPress={() => setShowParking((v) => !v)}>
                <MaterialCommunityIcons
                  name={showParking ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color="#111"
                />
                <MaterialCommunityIcons name="map-marker" size={18} color="#2F6BFF" style={styles.markerIcon} />
                <Text style={styles.filterText}>Parking mesto</Text>
              </Pressable>
            </View>
          </View>
        )}

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

        <Modal visible={showStartSuccess} transparent animationType="fade" onRequestClose={() => setShowStartSuccess(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.checkCircle}>
                <Text style={styles.check}>✓</Text>
              </View>

              <Text style={styles.modalTitle}>Iznajmljivanje uspešno započeto!</Text>

              <Pressable style={styles.okBtn} onPress={() => setShowStartSuccess(false)}>
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={endFlow === 'photo'} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.endCard}>
              <Text style={styles.endTitle}>
                Iznajmljivanje završi tako što ćeš{'\n'}dodati fotografiju bicikla:
              </Text>

              <Pressable
                style={[styles.photoBox, rideEndPhoto && styles.photoBoxDone]}
                onPress={pickRideEndPhoto}
              >
                {rideEndPhoto ? (
                  <Image source={{ uri: rideEndPhoto }} style={styles.previewImage} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera" size={44} color="#111" />
                    <Text style={styles.photoText}>Dodaj fotografiju</Text>
                  </>
                )}
              </Pressable>

              <Pressable style={styles.okBtn} onPress={onPhotoOk}>
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={endFlow === 'done'} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.doneCard}>
              <Text style={styles.doneTitle}>Iznajmljivanje uspešno završeno!</Text>

              <View style={styles.doneRow}>
                <View style={styles.doneMetric}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#111" />
                  <Text style={styles.doneMetricText}>{finalElapsed}</Text>
                </View>

                <View style={styles.doneMetric}>
                  <MaterialCommunityIcons name="cash" size={20} color="#111" />
                  <Text style={styles.doneMetricText}>{finalPrice} RSD</Text>
                </View>

                <View style={styles.doneMetric}>
                  <MaterialCommunityIcons name="bike" size={20} color="#111" />
                  <Text style={styles.doneMetricText}>#{finalBikeTag}</Text>
                </View>
              </View>

              <Pressable style={styles.okBtn} onPress={onFinishOk}>
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5A86D6' },
  mapWrapper: { flex: 1, position: 'relative' },
  map: { flex: 1 },

  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 5,
  },

  rideHud: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    zIndex: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  rideTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metric: { flexDirection: 'row', alignItems: 'center' },
  metricText: { marginLeft: 8, fontSize: 18, fontWeight: '900', color: '#111' },
  rideBottomRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  stopBtn: {
    backgroundColor: '#E53935',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#B71C1C',
  },
  stopBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  legendCard: {
    position: 'absolute',
    top: 6,
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

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },

  filterCard: {
    position: 'absolute',
    top: 6, 
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
  bikeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bikeText: { marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#111' },

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
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#111' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  modalCard: { width: '86%', backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center' },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#2ecc71',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  check: { color: '#fff', fontSize: 26, fontWeight: '900' },
  modalTitle: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 14 },

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

  endCard: { width: '86%', backgroundColor: '#fff', borderRadius: 18, padding: 18, alignItems: 'center' },
  endTitle: { width: '100%', fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 14 },

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
  photoBoxDone: { borderColor: '#2ecc71', backgroundColor: '#ECF9F0' },
  photoText: { marginTop: 10, fontSize: 16, fontWeight: '700', color: '#111' },
  previewImage: { width: '100%', height: 140, resizeMode: 'cover' },

  doneCard: { width: '86%', backgroundColor: '#fff', borderRadius: 18, padding: 18, alignItems: 'center' },
  doneTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 12 },
  doneRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  doneMetric: { flexDirection: 'row', alignItems: 'center' },
  doneMetricText: { marginLeft: 8, fontSize: 14, fontWeight: '800', color: '#111' },
});
