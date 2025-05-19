import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SearchSuggestions } from './SearchSuggestions';

type SearchBarProps = {
  query: string;
  onChangeQuery: (text: string) => void;
  onSearch: () => void;
  suggestions: string[];
};

export function SearchBar({ query, onChangeQuery, onSearch, suggestions }: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() ?? 'light';

  const handleFocus = () => {
    if (query.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setShowSuggestions(false);
  };

  const handleChangeText = (text: string) => {
    onChangeQuery(text);
    if (text.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
      return
    }
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    onSearch();
    inputRef.current?.blur();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChangeQuery(suggestion);
    setShowSuggestions(false);
    onSearch();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[styles.searchContainer]}
      >
        <IconSymbol
          name="magnifyingglass"
          size={20}
          color={Colors[colorScheme].icon}
        />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: Colors[colorScheme].text }]}
          placeholder="Buscar cursos..."
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeQuery('');
              setShowSuggestions(false);
            }}
            style={styles.clearButton}
          >
            <IconSymbol
              name="xmark.circle.fill"
              size={20}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        )}
      </ThemedView>

      <SearchSuggestions
        suggestions={suggestions}
        isVisible={showSuggestions && suggestions.length > 0}
        onSelectSuggestion={handleSelectSuggestion}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    outlineWidth: 0,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
});
