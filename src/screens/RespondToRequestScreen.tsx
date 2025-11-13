import React, { useState } from 'react';
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
import { Request } from '../types';

interface RespondToRequestScreenProps {
  navigation: any;
  route: {
    params: {
      request: Request;
    };
  };
}

const RespondToRequestScreen: React.FC<RespondToRequestScreenProps> = ({
  navigation,
  route
}) => {
  const { request } = route.params;
  const { user } = useAuth();
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!price || !description) {
      Alert.alert('Error', 'Please fill in price and description');
      return;
    }

    if (isNaN(parseFloat(price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setSubmitting(true);

    try {
      const newResponse = {
        requestId: request.id,
        vendorId: user?.id,
        vendorName: user?.displayName,
        vendorRating: user?.rating || 0,
        vendorReviewCount: user?.reviewCount || 0,
        price: parseFloat(price),
        description,
        features: features.split('\n').filter((f) => f.trim() !== ''),
        deliveryOptions: deliveryOptions.split('\n').filter((d) => d.trim() !== ''),
        estimatedDeliveryTime: estimatedDeliveryTime || undefined,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'responses'), newResponse);

      Alert.alert('Success', 'Your response has been submitted!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit response: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.requestCard}>
          <Text style={styles.requestTitle}>{request.title}</Text>
          <Text style={styles.requestDescription}>{request.description}</Text>
          <View style={styles.requestFooter}>
            <Text style={styles.categoryText}>{request.category}</Text>
            {request.budget?.max && (
              <Text style={styles.budgetText}>
                Budget: ${request.budget.min || 0} - ${request.budget.max}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Response</Text>

        <Text style={styles.label}>Price (USD) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          editable={!submitting}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your offering and why you're a good fit"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!submitting}
        />

        <Text style={styles.label}>Features (one per line)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
          value={features}
          onChangeText={setFeatures}
          multiline
          numberOfLines={4}
          editable={!submitting}
        />

        <Text style={styles.label}>Delivery Options (one per line)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Standard delivery&#10;Express delivery&#10;Pickup available"
          value={deliveryOptions}
          onChangeText={setDeliveryOptions}
          multiline
          numberOfLines={3}
          editable={!submitting}
        />

        <Text style={styles.label}>Estimated Delivery Time</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2-3 business days"
          value={estimatedDeliveryTime}
          onChangeText={setEstimatedDeliveryTime}
          editable={!submitting}
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Response</Text>
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
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10
  },
  requestDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500'
  },
  budgetText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 22,
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

export default RespondToRequestScreen;
