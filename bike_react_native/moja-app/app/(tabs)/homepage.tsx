import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Alert, Image } from 'react-native';
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import * as ImagePicker from 'expo-image-picker';

import { AppHeader } from '../../components/appHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLocalSearchParams, router } from 'expo-router';
import * as Location from 'expo-location';
import { fetchMapPins, fetchBikeById, setBikeStatus } from '../../src/services/mapService';
import { createRental } from '../../src/services/rentalService.js';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  const datum = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
  const vreme = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return { datum, vreme };
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}.`;
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};


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

const billedMinutes = (totalSec: number) => Math.max(1, Math.ceil(totalSec / 60));

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (x: number) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}


async function reverseGeocode(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=sr`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'bike-app/1.0' },
  });
  if (!res.ok) throw new Error('Reverse geocode failed');
  const data = await res.json();
  return (data?.display_name as string) || '';
}


export default function HomeMapScreen() {
  const [pins, setPins] = useState<any[]>([]);
  const [pinsLoading, setPinsLoading] = useState(true);

  const [filterOpen, setFilterOpen] = useState(false);
  const [showBikes, setShowBikes] = useState(true);
  const [showParking, setShowParking] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const { startRide, bikeId } = useLocalSearchParams();
  const [rideActive, setRideActive] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [elapsed, setElapsed] = useState('00:00');

  const [pricePerMinute, setPricePerMinute] = useState(12);
  const [bikeTag, setBikeTag] = useState(0);

  const [endFlow, setEndFlow] = useState<EndFlow>('none');
  const [rideEndPhoto, setRideEndPhoto] = useState<string | null>(null);

  const [finalElapsed, setFinalElapsed] = useState('00:00');
  const [finalPrice, setFinalPrice] = useState(0);
  const [finalBikeTag, setFinalBikeTag] = useState(0);

  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addressLoading, setAddressLoading] = useState(false);


  const [addressCache, setAddressCache] = useState<Record<string, string>>({});

  const [userLoc, setUserLoc] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [selectedBikeType, setSelectedBikeType] = useState<string>('—');
  const [selectedBikeImage, setSelectedBikeImage] = useState<string>('/images/bike2.png'); // fallback





  const totalPriceRsd = useMemo(() => {
    const mins = billedMinutes(elapsedSec);
    return mins * pricePerMinute;
  }, [elapsedSec, pricePerMinute]);




  useEffect(() => {
    let alive = true;

    const start = async () => {
      if (startRide !== 'true') return;
      setRideActive(true);
      const now = Date.now();
      setStartedAt(now);
      setElapsedSec(0);
      setElapsed('00:00');


      setPricePerMinute(12);
      const idStr = typeof bikeId === 'string' ? bikeId : null;

      if (idStr) {
        const bike = await fetchBikeById(idStr);

        if (alive && bike) {
          setBikeTag(Number(bike.id));
          setPricePerMinute(Number(bike.cena ?? 12));
          setSelectedBikeType(String(bike.tip ?? '—'));
          setSelectedBikeImage(String(bike.slika ?? '/images/bike2.png'));
        } else if (alive) {
          setBikeTag(Number(idStr));
        }
      } else {
        setBikeTag(0);
      }

      if (alive) {
        await Notifications.requestPermissionsAsync();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚲 Vožnja započeta!',
            body: `Bicikl #${bikeId} · ${pricePerMinute} RSD/min`,
            sound: true,
          },
          trigger: null, 
        });
      }

      router.replace('/(tabs)/homepage');
    };

    start();

    return () => {
      alive = false;
    };
  }, [startRide, bikeId]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLoc(loc.coords);
    })();
  }, []);


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
    return pins.filter((p) => {
      if (p.type === 'bike') return showBikes;
      if (p.type === 'parking') return showParking;
      return true;
    });
  }, [pins, showBikes, showParking]);

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

  useEffect(() => {
    let cancelled = false;

    async function run() {
      console.log('selectedPinId:', selectedPinId);
      console.log('selectedPin:', selectedPin);
      if (!selectedPin) {
        console.log('NO selectedPin');
        setSelectedAddress('');
        return;
      }

      const key = `${selectedPin.latitude.toFixed(5)},${selectedPin.longitude.toFixed(5)}`;


      if (addressCache[key]) {
        setSelectedAddress(addressCache[key]);
        setAddressLoading(false);
        return;
      }

      setAddressLoading(true);

      try {
        console.log('SELECTED PIN:', selectedPin);

        const addr = await reverseGeocode(selectedPin.latitude, selectedPin.longitude);

        if (!cancelled) {
          setSelectedAddress(addr);

          setAddressCache(prev => ({
            ...prev,
            [key]: addr,
          }));
        }
      } catch {
        if (!cancelled) {
          setSelectedAddress('Adresa nije dostupna');
        }
      } finally {
        if (!cancelled) {
          setAddressLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [selectedPinId]);
  useEffect(() => {
    if (!selectedPin || !userLoc) return;

    const d = getDistance(
      userLoc.latitude,
      userLoc.longitude,
      selectedPin.latitude,
      selectedPin.longitude
    );

    setDistance(d);
  }, [selectedPin, userLoc]);




  const onStopRidePress = async () => {
    const finalSec = elapsedSec;
    const finalElapsedStr = formatElapsed(finalSec);
    const finalMins = billedMinutes(finalSec);
    const finalTotal = finalMins * pricePerMinute;

    setFinalElapsed(finalElapsedStr);
    setFinalPrice(finalTotal);
    setFinalBikeTag(bikeTag);

    // ✅ 1) uzmi usera iz AsyncStorage
    // ✅ username + userId
    let username = 'unknown';
    let userId: number | null = null;
    try {
      const raw = await AsyncStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        username = user?.username ?? 'unknown';
        userId = user?.id ?? user?._id ?? null; // šta god imaš
      }
    } catch { }

    const startTs = startedAt ?? Date.now() - elapsedSec * 1000;
    const endTs = Date.now();

    const datum = formatDate(startTs);
    const vreme = `${formatTime(startTs)} - ${formatTime(endTs)}`;

    await createRental({
      userId: userId ?? 0,
      korisnik: username,
      bikeId: bikeTag,
      datum,
      vreme,
      minuta: billedMinutes(elapsedSec),
      tip: selectedBikeType,
      cenaPoMinutu: pricePerMinute,
      cena: billedMinutes(elapsedSec) * pricePerMinute,
      slika: selectedBikeImage,
    });

    if (bikeTag) {
      await setBikeStatus(String(bikeTag), 'Dostupan');
    }

    setRideActive(false);
    setStartedAt(null);

    setRideEndPhoto(null);
    setEndFlow('photo');
  };

  const resetRide = () => {
    setElapsedSec(0);
    setElapsed('00:00');
    setPricePerMinute(12);
    setBikeTag(0);
    setRideEndPhoto(null);
  };

  const onPhotoOk = () => {
    if (!rideEndPhoto) {
      Alert.alert('Greška', 'Molimo dodaj fotografiju bicikla.');
      return;
    }
    setEndFlow('done');
  };


  useEffect(() => {
    let alive = true;

    const load = async () => {
      const data = await fetchMapPins();
      if (!alive) return;
      setPins(data);
      setPinsLoading(false);
    };

    load();

    const interval = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);



  const onFinishOk = () => {
    setEndFlow('none');
    resetRide();
    fetchMapPins().then(setPins); // samo jedan refresh
    router.replace('/(tabs)/homepage');
  };

  return (
    <View style={styles.container}>
      <AppHeader onFilterPress={() => setFilterOpen((v) => !v)} />

      <View style={styles.mapWrapper}>
        <MapView style={styles.map} initialRegion={INITIAL_REGION} onPress={handleMapPress} showsUserLocation={true}
          showsMyLocationButton={true}>
          {filteredPins.map((p: any) => {
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

              {/* VREME */}
              <View style={styles.metric}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#111" />
                <Text style={styles.metricText}>{elapsed}</Text>
              </View>

              {/* UKUPNA CENA */}
              <View style={styles.metric}>
                <MaterialCommunityIcons name="cash" size={26} color="#111" />
                <Text style={styles.metricText}>{totalPriceRsd} RSD</Text>
              </View>

              {/* CENA PO MINUTI */}
              {/* <View style={styles.metric}>
                <MaterialCommunityIcons name="currency-rub" size={22} color="#111" />
                <Text style={styles.metricText}>{pricePerMinute} RSD/min</Text>
              </View> */}

              {/* ID BICIKLA */}
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

        {/* Bike info card */}
        {isBikeSelected && bikeInfo && (
          <View style={styles.bikeCard}>
            <View style={styles.bikeRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#111" />
              <Text style={styles.bikeText}>
                Adresa: {addressLoading ? 'Učitavanje…' : (selectedAddress || '—')}
              </Text>

            </View>
            <View style={styles.bikeRow}>
              <MaterialCommunityIcons name="bicycle" size={18} color="#111" />
              <Text style={styles.bikeText}>Tip: {bikeInfo.bikeType} bicikl, ID: {bikeInfo.bikeId}</Text>
            </View>
            <View style={styles.bikeRow}>
              <MaterialCommunityIcons name="cash" size={18} color="#111" />
              <Text style={styles.bikeText}>Cena: {bikeInfo.pricePerMinute} RSD po minutu</Text>
            </View>
            {(bikeInfo.bikeType === 'Električni' || bikeInfo.bikeType === 'Hibridni') && (
              <View style={styles.bikeRow}>
                <MaterialCommunityIcons name="battery" size={18} color="#111" />
                <Text style={styles.bikeText}>Baterija: {bikeInfo.battery}%</Text>
              </View>
            )}
          </View>
        )}

        {/* Parking info card */}
        {isParkingSelected && parkingInfo && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#111" />
              <Text style={styles.infoText}>
                Adresa: {addressLoading ? 'Učitavanje…' : (selectedAddress || '—')}
              </Text>

            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={18} color="#111" />
              <Text style={styles.infoText}>
                Udaljenost: {distance ? `${distance} m` : '—'}
              </Text>

            </View>
          </View>
        )}

        {/* Modal: uspešno započeto */}
        {/* <Modal visible={showStartSuccess} transparent animationType="fade" onRequestClose={() => setShowStartSuccess(false)}>
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
        </Modal> */}

        {/* Modal: foto na kraju */}
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

        {/* Modal: završeno */}
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