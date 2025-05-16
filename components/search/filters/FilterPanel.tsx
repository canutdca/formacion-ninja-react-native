import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { FilterChips } from './FilterChips';
import { FilterSection } from './FilterSection';

export type FilterOption = {
  id: string;
  label: string;
  count?: number;
};

export type Filters = {
  categories: string[];
  durations: string[];
  levels: string[];
};

type FilterPanelProps = {
  categories: FilterOption[];
  durations: FilterOption[];
  levels: FilterOption[];
  selectedFilters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClearFilters: () => void;
  visible: boolean;
  onClose: () => void;
};

export function FilterPanel({
  categories,
  durations,
  levels,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  visible,
  onClose,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const colorScheme = useColorScheme() ?? 'light';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const toggleFilterItem = (filterType: keyof Filters, itemId: string) => {
    const currentItems = selectedFilters[filterType];
    const updatedItems = currentItems.includes(itemId)
      ? currentItems.filter(id => id !== itemId)
      : [...currentItems, itemId];

    onFilterChange({
      ...selectedFilters,
      [filterType]: updatedItems,
    });
  };

  const getSelectedItems = () => {
    return [
      ...categories.filter(cat => selectedFilters.categories.includes(cat.id)),
      ...durations.filter(dur => selectedFilters.durations.includes(dur.id)),
      ...levels.filter(lvl => selectedFilters.levels.includes(lvl.id)),
    ];
  };

  const handleRemoveItem = (id: string) => {
    if (categories.find(cat => cat.id === id)) {
      toggleFilterItem('categories', id);
    } else if (durations.find(dur => dur.id === id)) {
      toggleFilterItem('durations', id);
    } else if (levels.find(lvl => lvl.id === id)) {
      toggleFilterItem('levels', id);
    }
  };

  const filterConfig = {
    categories: {
      title: 'Categorías',
      items: categories,
    },
    durations: {
      title: 'Duración',
      items: durations,
    },
    levels: {
      title: 'Nivel',
      items: levels,
    },
  } as const;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <ThemedView style={styles.modalContent}>
          <ScrollView style={styles.modalScrollView}>
            <ThemedView style={styles.container}>
              <ThemedView style={styles.header}>
                <ThemedText type="defaultSemiBold">Filtros</ThemedText>
                <TouchableOpacity onPress={onClose}>
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={24}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </ThemedView>

              <FilterChips
                selectedItems={getSelectedItems()}
                onRemoveItem={handleRemoveItem}
                onClearAll={onClearFilters}
              />

              <ThemedView style={styles.filterSections}>
                {(Object.keys(filterConfig) as (keyof Filters)[]).map((key) => (
                  <FilterSection
                    key={key}
                    title={filterConfig[key].title}
                    items={filterConfig[key].items}
                    isExpanded={expandedSections.has(key)}
                    isSelected={(id) => selectedFilters[key].includes(id)}
                    onToggleItem={(id) => toggleFilterItem(key, id)}
                    onToggleSection={() => toggleSection(key)}
                  />
                ))}
              </ThemedView>
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalScrollView: {
    padding: 16,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterSections: {
    marginBottom: 8,
  },
});
