import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

type SearchSuggestionsProps = {
  suggestions: string[];
  isVisible: boolean;
  onSelectSuggestion: (suggestion: string) => void;
};

export function SearchSuggestions({
  suggestions,
  isVisible,
  onSelectSuggestion
}: SearchSuggestionsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [debouncedState, setDebouncedState] = useState({
    suggestions: [] as string[],
    isVisible: false
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedState({
        suggestions,
        isVisible
      });
    }, 200);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [suggestions, isVisible]);

  useEffect(() => {
    if (debouncedState.isVisible && debouncedState.suggestions.length > 0) {
      Animated.timing(animatedHeight, {
        toValue: Math.min(debouncedState.suggestions.length * 44, 220),
        duration: 200,
        useNativeDriver: false,
      }).start();
      return
    }
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [debouncedState.isVisible, debouncedState.suggestions.length, animatedHeight]);

  if (!debouncedState.isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.suggestionsContainer,
        { height: animatedHeight }
      ]}
    >
      <FlatList
        data={debouncedState.suggestions.slice(0, 5)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => onSelectSuggestion(item)}
          >
            <IconSymbol
              name="clock"
              size={16}
              color={Colors[colorScheme].icon}
              style={styles.suggestionIcon}
            />
            <ThemedText style={styles.suggestionText} numberOfLines={1}>{item}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    color: '#000',
    fontSize: 16,
  },
});
