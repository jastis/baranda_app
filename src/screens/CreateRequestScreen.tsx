import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentLocation, LocationCoords } from '../utils/location';

interface CreateRequestScreenProps {
  navigation: any;
}

const categories = [
  'Electronics',
  'Home Services',
  'Food & Beverage',
  'Transportation',
  'Health & Wellness',
  'Education',
  'Professional Services',
  'Other'
];

const CreateRequestScreen: React.FC<CreateRequestScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
    setLoadingLocation(true);
    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setLocation(currentLocation);
    } else {
      Alert.alert(
        'Location Error',
        'Could not get your current location. Please enable location services.'
      );
    }
    setLoadingLocation(false);
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please enable location services');
      return;
    }

    setSubmitting(true);

    try {
      const newRequest = {
        requesterId: user?.id,
        requesterName: user?.displayName,
        title,
        description,
        category,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        status: 'open',
        createdAt: serverTimestamp(),
        budget: {
          min: minBudget ? parseFloat(minBudget) : undefined,
          max: maxBudget ? parseFloat(maxBudget) : undefined
        }
      };

      await addDoc(collection(db, 'requests'), newRequest);
      Alert.alert('Success', 'Your request has been created!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create request: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Request</Text>

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="What do you need?"
          value={title}
          onChangeText={setTitle}
          editable={!submitting}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Provide details about your request"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!submitting}
        />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive
              ]}
              onPress={() => setCategory(cat)}
              disabled={submitting}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Budget (Optional)</Text>
        <View style={styles.budgetContainer}>
          <TextInput
            style={[styles.input, styles.budgetInput]}
            placeholder="Min"
            value={minBudget}
            onChangeText={setMinBudget}
            keyboardType="numeric"
            editable={!submitting}
          />
          <Text style={styles.budgetSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.budgetInput]}
            placeholder="Max"
            value={maxBudget}
            onChangeText={setMaxBudget}
            keyboardType="numeric"
            editable={!submitting}
          />
        </View>

        <Text style={styles.label}>Location</Text>
        <View style={styles.locationContainer}>
          {loadingLocation ? (
            <ActivityIndicator color="#2563eb" />
          ) : location ? (
            <>
              <Text style={styles.locationText}>
                {location.address || `${location.latitude}, ${location.longitude}`}
              </Text>
              <TouchableOpacity onPress={loadCurrentLocation} disabled={submitting}>
                <Text style={styles.refreshButton}>Refresh</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={loadCurrentLocation} disabled={submitting}>
              <Text style={styles.enableLocationText}>Enable Location</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 15
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5
  },
  categoryButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent'
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
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  budgetInput: {
    flex: 1
  },
  budgetSeparator: {
    marginHorizontal: 10,
    fontSize: 18,
    color: '#6b7280'
  },
  locationContainer: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  locationText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1
  },
  refreshButton: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14
  },
  enableLocationText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default CreateRequestScreen;
