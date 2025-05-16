import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FilterOption } from './FilterPanel';

type FilterChipsProps = {
  selectedItems: FilterOption[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
};

export function FilterChips({ selectedItems, onRemoveItem, onClearAll }: FilterChipsProps) {
  const colorScheme = useColorScheme() ?? 'light';

  if (selectedItems.length === 0) return null;

  return (
    <ThemedView style={styles.chipsWrapper}>
      <ThemedView style={styles.chipsContainer}>
        <ThemedView style={styles.chipsList}>
          {selectedItems.map(item => (
            <ThemedView key={item.id} style={styles.chip}>
              <ThemedText style={styles.chipText}>{item.label}</ThemedText>
              <TouchableOpacity
                onPress={() => onRemoveItem(item.id)}
              >
                <IconSymbol
                  name="xmark.circle.fill"
                  size={16}
                  color={Colors[colorScheme].icon}
                />
              </TouchableOpacity>
            </ThemedView>
          ))}
        </ThemedView>

        <TouchableOpacity
          onPress={onClearAll}
          style={styles.clearButton}
        >
          <ThemedText style={styles.clearButtonText}>Borrar todos</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chipsWrapper: {
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chipsList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 14,
    marginRight: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#0a7ea4',
  },
});
