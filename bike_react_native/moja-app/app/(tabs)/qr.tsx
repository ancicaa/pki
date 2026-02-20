import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { router, useFocusEffect } from 'expo-router';
import { fetchAvailableBikes, setBikeStatus } from '../../src/services/mapService.js';

type Phase = 'scanning' | 'processing';

type BikeOption = { id: string; label: string };

export default function QrScreen() {
  const [phase, setPhase] = useState<Phase>('scanning');
  const [showSuccess, setShowSuccess] = useState(false);

  const scanLineY = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bikeMenuVisible, setBikeMenuVisible] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);

  const [availableBikes, setAvailableBikes] = useState<BikeOption[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setPhase('scanning');
      setShowSuccess(false);
      setBikeMenuVisible(false);
      setSelectedBikeId(null);

      (async () => {
        setLoadingBikes(true);
        const bikes = await fetchAvailableBikes();
        if (isActive) setAvailableBikes(bikes);
        setLoadingBikes(false);
      })();

      return () => {
        isActive = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setPhase('scanning');
      };
    }, [])
  );

  useEffect(() => {
    if (phase !== 'scanning') return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [phase, scanLineY]);

  const lineTranslate = scanLineY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 170],
  });

  const openBikeMenu = () => {
    if (phase !== 'scanning') return;
    setBikeMenuVisible(true);
  };

  const selectBike = async (bikeId: string) => {
    if (phase !== 'scanning') return;
  
    setSelectedBikeId(bikeId);
    setBikeMenuVisible(false);
    setPhase('processing');
  
    const updated = await setBikeStatus(bikeId, 'Iznajmljen');
  
    if (!updated) {
      setPhase('scanning');
      setLoadingBikes(true);
      const bikes = await fetchAvailableBikes();
      setAvailableBikes(bikes);
      setLoadingBikes(false);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  
    timerRef.current = setTimeout(() => {
      router.replace(
        `/(tabs)/homepage?startRide=true&bikeId=${encodeURIComponent(bikeId)}`
      );
    }, 400); 
  };

  return (
    <Pressable style={styles.container} onPress={openBikeMenu}>

      <View style={styles.fakeCamera} />
      <View style={styles.dim} />

      <Text style={styles.header}>Skeniranje QR</Text>

      <View style={styles.centerWrap}>
        <View style={styles.frame}>
         
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          {phase === 'scanning' && (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: lineTranslate }] },
              ]}
            />
          )}
        </View>

        <Text style={styles.bottomText}>
          {phase === 'scanning'
            ? 'Tapni da izabereš bicikl (umesto QR skenera)'
            : 'Obrađujem...'}
        </Text>

        <Text style={styles.hint}>
          {phase === 'scanning'
            ? `Dostupno: ${availableBikes.length} • Izabrano: ${selectedBikeId ?? '—'}`
            : `Proveravam: ${selectedBikeId ?? '—'}`}
        </Text>
      </View>

      <Modal visible={bikeMenuVisible} transparent animationType="fade">
        <Pressable style={styles.menuBackdrop} onPress={() => setBikeMenuVisible(false)}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <Text style={styles.menuTitle}>Izaberi dostupni bicikl</Text>

            {loadingBikes ? (
              <View style={styles.menuLoading}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.menuEmpty}>Učitavam dostupne bicikle...</Text>
              </View>
            ) : availableBikes.length === 0 ? (
              <Text style={styles.menuEmpty}>Trenutno nema dostupnih bicikla.</Text>
            ) : (
              <FlatList
                data={availableBikes}
                keyExtractor={(x) => x.id}
                ItemSeparatorComponent={() => <View style={styles.menuSep} />}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => selectBike(item.id)}
                  >
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </Pressable>
                )}
              />
            )}

            <Pressable style={styles.menuCancel} onPress={() => setBikeMenuVisible(false)}>
              <Text style={styles.menuCancelText}>Otkaži</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {phase === 'processing' && (
        <View style={StyleSheet.absoluteFillObject}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={styles.processingCenter}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.processingLabel}>
              Proveravam{selectedBikeId ? `: ${selectedBikeId}` : '...'}
            </Text>
          </View>
        </View>
      )}

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.checkCircle}>
              <Text style={styles.check}>✓</Text>
            </View>

            <Text style={styles.modalTitle}>Iznajmljivanje uspešno započeto!</Text>

            <Pressable style={styles.okBtn} onPress={() => setShowSuccess(false)}>
              <Text style={styles.okText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },

  fakeCamera: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2a2a2a',
  },

  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  header: {
    position: 'absolute',
    top: 56,
    left: 20,
    fontSize: 22,
    fontWeight: '700',
    color: '#4da3ff',
  },

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  frame: {
    width: 260,
    height: 260,
    borderRadius: 12,
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#111',
    borderWidth: 5,
  },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    top: 40,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },

  bottomText: {
    marginTop: 22,
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  processingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingLabel: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 16,
    justifyContent: 'center',
  },
  menuCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  menuLoading: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmpty: {
    color: 'rgba(255,255,255,0.7)',
    paddingVertical: 10,
    textAlign: 'center',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  menuItemText: {
    color: '#fff',
    fontWeight: '700',
  },
  menuSep: {
    height: 10,
  },
  menuCancel: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  menuCancelText: {
    color: '#fff',
    fontWeight: '800',
  },

  // Existing success modal styles (ostavljeno)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
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

  modalTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 14,
  },

  okBtn: {
    width: 120,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#e9edf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okText: { fontWeight: '700', color: '#333' },
});