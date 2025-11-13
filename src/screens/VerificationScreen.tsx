import React, { useState, useEffect } from 'react';
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
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserVerification } from '../types';
import { showImagePickerOptions, uploadImage } from '../utils/imageUpload';

const VerificationScreen: React.FC<any> = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<UserVerification | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [idType, setIdType] = useState<'nin' | 'bvn' | 'drivers_license' | 'passport'>('nin');
  const [idNumber, setIdNumber] = useState('');
  const [idDocumentUri, setIdDocumentUri] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [businessDocumentUri, setBusinessDocumentUri] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadVerification();
  }, []);

  const loadVerification = async () => {
    try {
      const verificationDoc = await getDoc(doc(db, 'userVerifications', user!.id));
      if (verificationDoc.exists()) {
        setVerification(verificationDoc.data() as UserVerification);
      } else {
        // Create default verification record
        const defaultVerification: UserVerification = {
          id: user!.id,
          userId: user!.id,
          phoneVerified: false,
          emailVerified: false,
          idVerified: false,
          businessVerified: false,
          verificationScore: 0,
          updatedAt: Timestamp.now() as any,
        };
        await setDoc(doc(db, 'userVerifications', user!.id), defaultVerification);
        setVerification(defaultVerification);
      }
    } catch (error) {
      console.error('Error loading verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // In production, integrate with SMS provider (Twilio, etc.)
    setOtpSent(true);
    Alert.alert('OTP Sent', 'A verification code has been sent to your phone number.');
  };

  const verifyPhoneOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    // In production, verify OTP with backend
    try {
      await updateDoc(doc(db, 'userVerifications', user!.id), {
        phoneVerified: true,
        phoneVerifiedAt: Timestamp.now(),
        verificationScore: (verification?.verificationScore || 0) + 25,
        updatedAt: Timestamp.now(),
      });

      await updateDoc(doc(db, 'users', user!.id), {
        phoneNumber,
        phoneVerified: true,
        verificationScore: (verification?.verificationScore || 0) + 25,
      });

      Alert.alert('Success', 'Phone number verified successfully');
      loadVerification();
      refreshUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to verify phone number');
    }
  };

  const handleIdDocumentPick = async () => {
    const uri = await showImagePickerOptions();
    if (uri) {
      setIdDocumentUri(uri);
    }
  };

  const submitIdVerification = async () => {
    if (!idNumber || !idDocumentUri) {
      Alert.alert('Error', 'Please provide ID number and upload document');
      return;
    }

    setUploading(true);

    try {
      // Upload ID document
      const uploadResult = await uploadImage(idDocumentUri, 'id_documents', user!.id);

      await updateDoc(doc(db, 'userVerifications', user!.id), {
        idType,
        idNumber,
        idDocumentUrl: uploadResult.url,
        updatedAt: Timestamp.now(),
      });

      Alert.alert(
        'Submitted',
        'Your ID verification has been submitted for review. You will be notified once verified.'
      );
      loadVerification();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit ID verification');
    } finally {
      setUploading(false);
    }
  };

  const handleBusinessDocumentPick = async () => {
    const uri = await showImagePickerOptions();
    if (uri) {
      setBusinessDocumentUri(uri);
    }
  };

  const submitBusinessVerification = async () => {
    if (!businessRegNumber || !businessDocumentUri) {
      Alert.alert('Error', 'Please provide business registration number and document');
      return;
    }

    setUploading(true);

    try {
      // Upload business document
      const uploadResult = await uploadImage(businessDocumentUri, 'business_documents', user!.id);

      await updateDoc(doc(db, 'userVerifications', user!.id), {
        businessRegNumber,
        businessDocumentUrl: uploadResult.url,
        updatedAt: Timestamp.now(),
      });

      Alert.alert(
        'Submitted',
        'Your business verification has been submitted for review. You will be notified once verified.'
      );
      loadVerification();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit business verification');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Verification Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Verification Score</Text>
        <Text style={styles.scoreValue}>{verification?.verificationScore || 0}/100</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${verification?.verificationScore || 0}%` },
            ]}
          />
        </View>
        <Text style={styles.scoreHint}>
          Higher scores increase trust and opportunities
        </Text>
      </View>

      {/* Phone Verification */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📱 Phone Verification</Text>
          {verification?.phoneVerified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
        </View>

        {!verification?.phoneVerified ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            {otpSent ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <TouchableOpacity style={styles.button} onPress={verifyPhoneOTP}>
                  <Text style={styles.buttonText}>Verify OTP</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.button} onPress={sendPhoneOTP}>
                <Text style={styles.buttonText}>Send OTP</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.verifiedText}>
            Phone number {phoneNumber} is verified ✓
          </Text>
        )}
      </View>

      {/* Email Verification */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✉️ Email Verification</Text>
          {verification?.emailVerified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
        </View>

        {!verification?.emailVerified ? (
          <>
            <Text style={styles.sectionText}>
              A verification email will be sent to {user?.email}
            </Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Send Verification Email</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.verifiedText}>Email {user?.email} is verified ✓</Text>
        )}
      </View>

      {/* ID Verification */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🪪 ID Verification</Text>
          {verification?.idVerified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
        </View>

        {!verification?.idVerified && !verification?.idDocumentUrl ? (
          <>
            <Text style={styles.sectionText}>Select ID type:</Text>
            <View style={styles.radioGroup}>
              {(['nin', 'bvn', 'drivers_license', 'passport'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.radioButton,
                    idType === type && styles.radioButtonSelected,
                  ]}
                  onPress={() => setIdType(type)}
                >
                  <Text
                    style={[
                      styles.radioButtonText,
                      idType === type && styles.radioButtonTextSelected,
                    ]}
                  >
                    {type === 'nin' ? 'NIN' : type === 'bvn' ? 'BVN' : type === 'drivers_license' ? 'Driver\'s License' : 'Passport'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="ID Number"
              value={idNumber}
              onChangeText={setIdNumber}
            />

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleIdDocumentPick}
            >
              <Text style={styles.uploadButtonText}>
                {idDocumentUri ? '✓ Document Selected' : '📄 Upload ID Document'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={submitIdVerification}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit for Verification</Text>
              )}
            </TouchableOpacity>
          </>
        ) : verification?.idVerified ? (
          <Text style={styles.verifiedText}>ID verified ✓</Text>
        ) : (
          <Text style={styles.pendingText}>ID verification pending review...</Text>
        )}
      </View>

      {/* Business Verification (Vendors Only) */}
      {user?.userType === 'vendor' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏢 Business Verification</Text>
            {verification?.businessVerified && (
              <Text style={styles.verifiedBadge}>✓ Verified</Text>
            )}
          </View>

          {!verification?.businessVerified && !verification?.businessDocumentUrl ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Business Registration Number"
                value={businessRegNumber}
                onChangeText={setBusinessRegNumber}
              />

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleBusinessDocumentPick}
              >
                <Text style={styles.uploadButtonText}>
                  {businessDocumentUri
                    ? '✓ Document Selected'
                    : '📄 Upload Business Document'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={submitBusinessVerification}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit for Verification</Text>
                )}
              </TouchableOpacity>
            </>
          ) : verification?.businessVerified ? (
            <Text style={styles.verifiedText}>Business verified ✓</Text>
          ) : (
            <Text style={styles.pendingText}>
              Business verification pending review...
            </Text>
          )}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCard: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  scoreHint: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedBadge: {
    backgroundColor: '#4caf50',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  radioButtonText: {
    fontSize: 14,
    color: '#666',
  },
  radioButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
  },
  pendingText: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: '500',
  },
});

export default VerificationScreen;
