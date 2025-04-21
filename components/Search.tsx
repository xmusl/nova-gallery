import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type Props = {
  onSearch: (query: string) => void;
};

export function Search({ onSearch }: Props) {
  const [query, setQuery] = useState('');
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].text;

  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={24} color={iconColor} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: iconColor }]}
        placeholder="Search photos..."
        placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
        value={query}
        onChangeText={(text: string) => {
          setQuery(text);
          onSearch(text);
        }}
      />
      {query.length > 0 && (
        <Pressable
          onPress={() => {
            setQuery('');
            onSearch('');
          }}
          style={styles.clearButton}
        >
          <MaterialIcons name="close" size={20} color={iconColor} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
});
