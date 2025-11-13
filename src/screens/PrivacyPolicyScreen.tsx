import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide when creating an account, including name, email, phone number, and location. We also collect transaction data and usage information.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Your information is used to: provide our services, process payments, verify your identity, prevent fraud, communicate with you, and improve our platform.
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We share your information with: service providers when you accept their quote, payment processors for transactions, and law enforcement when required by law.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We use industry-standard encryption to protect your data. Payment information is processed through secure payment gateways and never stored on our servers.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to: access your personal data, request corrections, delete your account, opt-out of marketing communications, and export your data.
        </Text>

        <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
        <Text style={styles.paragraph}>
          We use cookies and similar technologies to improve user experience, analyze usage patterns, and personalize content.
        </Text>

        <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We use third-party services including Firebase, Paystack, and cloud storage providers. These services have their own privacy policies.
        </Text>

        <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our service is not intended for users under 18. We do not knowingly collect information from children.
        </Text>

        <Text style={styles.sectionTitle}>9. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your data as long as your account is active and for a reasonable period after deletion for legal and business purposes.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this policy from time to time. Significant changes will be communicated to users via email or app notification.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          For privacy concerns or questions, contact us at privacy@aswani.app
        </Text>

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#999',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
});

export default PrivacyPolicyScreen;
