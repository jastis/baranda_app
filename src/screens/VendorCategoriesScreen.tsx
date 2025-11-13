import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { VENDOR_CATEGORIES } from '../types';

interface VendorCategoriesScreenProps {
  navigation: any;
}

const VendorCategoriesScreen: React.FC<VendorCategoriesScreenProps> = ({ navigation }) => {
  const { user, updateUserProfile } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    user?.vendorCategories || []
  );
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessDescription, setBusinessDescription] = useState(
    user?.businessDescription || ''
  );
  const [serviceArea, setServiceArea] = useState(
    user?.serviceArea?.toString() || '10'
  );
  const [loading, setLoading] = useState(false);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    if (!businessName.trim()) {
      Alert.alert('Error', 'Please enter your business name');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        vendorCategories: selectedCategories,
        businessName: businessName.trim(),
        businessDescription: businessDescription.trim() || undefined,
        serviceArea: parseFloat(serviceArea) || 10
      });

      Alert.alert('Success', 'Your vendor profile has been updated!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vendor Profile Setup</Text>
        <Text style={styles.subtitle}>
          Select the categories that best describe your services or products
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your business name"
            value={businessName}
            onChangeText={setBusinessName}
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Business Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your business and what you offer"
            value={businessDescription}
            onChangeText={setBusinessDescription}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Service Area (km radius)</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            value={serviceArea}
            onChangeText={setServiceArea}
            keyboardType="numeric"
            editable={!loading}
          />
          <Text style={styles.hint}>
            Maximum distance you're willing to travel for services
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Service Categories *</Text>
          <Text style={styles.hint}>
            Select all categories that apply ({selectedCategories.length} selected)
          </Text>

          <View style={styles.categoriesContainer}>
            {VENDOR_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategories.includes(category) && styles.categoryButtonActive
                ]}
                onPress={() => toggleCategory(category)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategories.includes(category) && styles.categoryTextActive
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Vendor Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 30
  },
  section: {
    marginBottom: 25
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
    marginBottom: 10
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  categoryButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb'
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280'
  },
  categoryTextActive: {
    color: '#2563eb',
    fontWeight: '600'
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default VendorCategoriesScreen;
