import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FilterOption } from './FilterPanel';

type FilterSectionProps = {
  title: string;
  items: FilterOption[];
  isExpanded: boolean;
  isSelected: (id: string) => boolean;
  onToggleItem: (id: string) => void;
  onToggleSection: () => void;
};

export function FilterSection({
  title,
  items,
  isExpanded,
  isSelected,
  onToggleItem: onToggle,
  onToggleSection,
}: FilterSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggleSection}
      >
        <ThemedView style={styles.sectionHeaderContent}>
          <IconSymbol
            name={isExpanded ? 'chevron.up' : 'chevron.down'}
            size={16}
            color={Colors[colorScheme].icon}
          />
          <ThemedText>{title}</ThemedText>
        </ThemedView>
      </TouchableOpacity>

      {isExpanded && (
        <ThemedView style={styles.optionsContainer}>
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.optionItem}
              onPress={() => onToggle(item.id)}
            >
              <ThemedView style={styles.checkboxContainer}>
                <ThemedView
                  style={[
                    styles.checkbox,
                    isSelected(item.id) && styles.checkboxSelected
                  ]}
                >
                  {isSelected(item.id) && (
                    <IconSymbol
                      name="checkmark"
                      size={12}
                      color="white"
                    />
                  )}
                </ThemedView>
              </ThemedView>
              <ThemedText>{item.label}</ThemedText>
              {item.count !== undefined && (
                <ThemedText style={styles.countText}>({item.count})</ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  countText: {
    marginLeft: 6,
    opacity: 0.5,
  },
});
