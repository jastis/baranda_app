import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface HowItWorksScreenProps {
  navigation: any;
}

const HowItWorksScreen: React.FC<HowItWorksScreenProps> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How Aswani Works</Text>
        <Text style={styles.headerSubtitle}>Your guide to getting started</Text>
      </View>

      {/* For Requesters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛍️ For Requesters</Text>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Create Your Request</Text>
            <Text style={styles.stepDescription}>
              Post what you need - a product, service, or task. Include details, location, and budget.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Receive Quotes</Text>
            <Text style={styles.stepDescription}>
              Nearby vendors will see your request and send competitive quotes with pricing and delivery options.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Compare & Choose</Text>
            <Text style={styles.stepDescription}>
              Review all responses, compare prices, check vendor ratings, and choose the best offer.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Connect & Complete</Text>
            <Text style={styles.stepDescription}>
              Chat or call your chosen vendor directly. Track progress and complete the transaction.
            </Text>
          </View>
        </View>
      </View>

      {/* For Vendors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏪 For Vendors</Text>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Set Up Your Profile</Text>
            <Text style={styles.stepDescription}>
              Complete your business profile, add categories you serve, and set your service area.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Receive Notifications</Text>
            <Text style={styles.stepDescription}>
              Get instant alerts for new requests in your area matching your services.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Send Your Quote</Text>
            <Text style={styles.stepDescription}>
              Respond with your best price, features, and delivery options. Upload product images.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Win & Deliver</Text>
            <Text style={styles.stepDescription}>
              When chosen, communicate with the customer and complete the job to build your reputation.
            </Text>
          </View>
        </View>
      </View>

      {/* Tips & Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Pro Tips</Text>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>⭐</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Featured Items</Text>
            <Text style={styles.tipText}>
              Vendors can feature up to 3 products/services to increase visibility and attract more customers.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>🔔</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Product Alerts</Text>
            <Text style={styles.tipText}>
              Set alerts for specific products or services and get notified when they become available.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>📍</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Location Matters</Text>
            <Text style={styles.tipText}>
              Requests are matched with vendors based on distance, so accurate location helps both parties.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💬</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Communication</Text>
            <Text style={styles.tipText}>
              Use in-app chat and calling to coordinate details, ask questions, and build trust.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>⚡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Quick Response</Text>
            <Text style={styles.tipText}>
              Vendors who respond quickly get more business. Speed and reliability build reputation.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.getStartedButtonText}>Got It!</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    backgroundColor: '#667eea',
    padding: 30,
    borderRadius: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  getStartedButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HowItWorksScreen;
