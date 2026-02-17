import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

type Props = {
  onFilterPress?: () => void;
};

export function AppHeader({ onFilterPress }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {/* LOGO */}
        <Image
          source={require('../assets/images/logo_header.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* FILTER IKONICA */}
        {onFilterPress ? (
          <TouchableOpacity onPress={onFilterPress} hitSlop={10}>
            <Feather name="filter" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} /> 
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#5A86D6', 
    marginTop:-10
  },

  header: {
    height: 20,                 
    backgroundColor: '#5A86D6',
    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    height: 40,  
    width: 140,  
  },
  
});
