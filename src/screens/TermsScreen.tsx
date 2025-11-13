import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TermsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using Aswani, you accept and agree to be bound by these Terms of Service.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Service</Text>
        <Text style={styles.paragraph}>
          Aswani provides a platform connecting requesters with service providers. You must be at least 18 years old to use this service.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Payment and Fees</Text>
        <Text style={styles.paragraph}>
          All payments are processed securely through our escrow system. A platform fee of 5% applies to all transactions. Fees are clearly disclosed before payment.
        </Text>

        <Text style={styles.sectionTitle}>5. Escrow Protection</Text>
        <Text style={styles.paragraph}>
          Funds are held in escrow until service completion is confirmed. Requesters must confirm completion within 7 days, after which funds are automatically released to the vendor.
        </Text>

        <Text style={styles.sectionTitle}>6. Disputes</Text>
        <Text style={styles.paragraph}>
          In case of disputes, both parties should attempt resolution through our dispute system. Aswani reserves the right to make final decisions on disputed transactions.
        </Text>

        <Text style={styles.sectionTitle}>7. User Conduct</Text>
        <Text style={styles.paragraph}>
          Users must not engage in fraudulent activities, harassment, or any behavior that violates Nigerian laws. Violations may result in account suspension or termination.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          Aswani is a platform connecting users. We are not responsible for the quality of services provided. Users transact at their own risk.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. Users will be notified of significant changes.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms, contact us at support@aswani.app
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

export default TermsScreen;
