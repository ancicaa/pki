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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { router, useFocusEffect } from 'expo-router';

type Phase = 'scanning' | 'processing';

export default function QrScreen() {
  // 1) scanning
  // 2) processing (blur + spinner)
  // 3) success modal (ne mora ti ovde, ali ostavljam kako si imala)
  const [phase, setPhase] = useState<Phase>('scanning');
  const [showSuccess, setShowSuccess] = useState(false);

  const scanLineY = useRef(new Animated.Value(0)).current;

  // ✅ bitno: timeout ref (da možemo da ga očistimo)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ RESET svaki put kad uđeš opet u QR tab
  useFocusEffect(
    useCallback(() => {
      // kada ekran dobije fokus
      setPhase('scanning');
      setShowSuccess(false);

      return () => {
        // kada izgubi fokus (odeš na drugi tab)
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

  const mockScan = () => {
    if (phase !== 'scanning') return;

    setPhase('processing');

    // ✅ očisti prethodni timeout (za svaki slučaj)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setTimeout(() => {
      // ideš na mapu sa parametrom startRide
      router.replace('/(tabs)/homepage?startRide=true');
    }, 900);
  };

  return (
    <Pressable style={styles.container} onPress={mockScan}>
      {/* “kamera” mock */}
      <View style={styles.fakeCamera} />

      {/* dim overlay */}
      <View style={styles.dim} />

      {/* Header */}
      <Text style={styles.header}>Skeniranje QR</Text>

      {/* Skener UI */}
      <View style={styles.centerWrap}>
        <View style={styles.frame}>
          {/* uglovi */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          {/* scanning linija */}
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
          {phase === 'scanning' ? 'Skeniraj QR kod!' : 'Obrađujem...'}
        </Text>

        <Text style={styles.hint}>(Tapni da simuliraš skeniranje)</Text>
      </View>

      {/* Slika 2: blur + spinner overlay */}
      {phase === 'processing' && (
        <View style={StyleSheet.absoluteFillObject}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={styles.processingCenter}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.processingLabel}>Proveravam QR...</Text>
          </View>
        </View>
      )}

      {/* Slika 3: success modal (ostavljam, ali ti ga realno ne koristiš ovde) */}
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
