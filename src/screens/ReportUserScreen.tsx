import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { db } from '../services/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserReport } from '../types';
import { showImagePickerOptions, uploadMultipleImages } from '../utils/imageUpload';

interface ReportUserScreenProps {
  route: any;
  navigation: any;
}

const ReportUserScreen: React.FC<ReportUserScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { reportedUser, requestId } = route.params;

  const [selectedReason, setSelectedReason] = useState<UserReport['reason'] | null>(null);
  const [description, setDescription] = useState('');
  const [evidenceUris, setEvidenceUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const reasons: { value: UserReport['reason']; label: string }[] = [
    { value: 'spam', label: '🚫 Spam' },
    { value: 'fraud', label: '⚠️ Fraud/Scam' },
    { value: 'inappropriate', label: '🔞 Inappropriate Content' },
    { value: 'harassment', label: '😠 Harassment' },
    { value: 'fake_profile', label: '👤 Fake Profile' },
    { value: 'other', label: '🔧 Other' },
  ];

  const handleAddEvidence = async () => {
    const uri = await showImagePickerOptions();
    if (uri) {
      setEvidenceUris([...evidenceUris, uri]);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    setUploading(true);

    try {
      let evidenceUrls: string[] = [];

      // Upload evidence if provided
      if (evidenceUris.length > 0) {
        const uploadResults = await uploadMultipleImages(
          evidenceUris,
          'reports',
          user!.id
        );
        evidenceUrls = uploadResults.map(r => r.url);
      }

      const reportData: Omit<UserReport, 'id'> = {
        reporterId: user!.id,
        reporterName: user!.displayName,
        reportedUserId: reportedUser.id,
        reportedUserName: reportedUser.name,
        reason: selectedReason,
        description: description.trim(),
        evidence: evidenceUrls,
        relatedRequestId: requestId,
        status: 'pending',
        createdAt: Timestamp.now() as any,
      };

      await addDoc(collection(db, 'userReports'), reportData);

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our team will review it and take appropriate action.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${reportedUser.name}? You won't see their responses or messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'blockedUsers'), {
                userId: user!.id,
                blockedUserId: reportedUser.id,
                createdAt: Timestamp.now(),
              });

              Alert.alert('User Blocked', `${reportedUser.name} has been blocked.`, [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report User</Text>
          <Text style={styles.headerSubtitle}>
            Reporting: {reportedUser.name}
          </Text>
        </View>

        {/* Reason Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Reason *</Text>
          <View style={styles.reasonsGrid}>
            {reasons.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[
                  styles.reasonButton,
                  selectedReason === reason.value && styles.reasonButtonSelected,
                ]}
                onPress={() => setSelectedReason(reason.value)}
              >
                <Text
                  style={[
                    styles.reasonButtonText,
                    selectedReason === reason.value && styles.reasonButtonTextSelected,
                  ]}
                >
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Please provide details about the issue..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Evidence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Add screenshots or images that support your report
          </Text>

          {evidenceUris.map((uri, index) => (
            <View key={index} style={styles.evidenceItem}>
              <Text style={styles.evidenceText}>✓ Image {index + 1} added</Text>
              <TouchableOpacity
                onPress={() => {
                  setEvidenceUris(evidenceUris.filter((_, i) => i !== index));
                }}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addEvidenceButton} onPress={handleAddEvidence}>
            <Text style={styles.addEvidenceButtonText}>📷 Add Evidence</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitReport}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>

        {/* Block User Button */}
        <TouchableOpacity style={styles.blockButton} onPress={handleBlockUser}>
          <Text style={styles.blockButtonText}>🚫 Block This User</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Your report is confidential. The reported user will not be notified.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 15,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  reasonButtonSelected: {
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  reasonButtonText: {
    fontSize: 14,
    color: '#666',
  },
  reasonButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
  },
  evidenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  evidenceText: {
    fontSize: 14,
    color: '#4caf50',
  },
  removeText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '600',
  },
  addEvidenceButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addEvidenceButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#ff4444',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  blockButton: {
    backgroundColor: '#333',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  infoText: {
    fontSize: 13,
    color: '#856404',
  },
});

export default ReportUserScreen;
