import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const VendorAnalyticsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState({
    // Performance
    quotesViewed: 0,
    quotesSubmitted: 0,
    quotesAccepted: 0,
    conversionRate: 0,

    // Financial
    totalRevenue: 0,
    averageOrderValue: 0,
    totalTransactions: 0,
    pendingEarnings: 0,

    // Engagement
    averageResponseTime: 0, // in minutes
    responseRate: 100,
    profileViews: 0,

    // Ratings
    averageRating: 0,
    totalReviews: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,

    // Popular
    popularCategories: [] as { category: string; count: number }[],
    topLocations: [] as { location: string; count: number }[],
  });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      const now = new Date();
      const startDate = new Date();

      // Calculate date range based on period
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // Get responses
      const responsesQuery = query(
        collection(db, 'responses'),
        where('vendorId', '==', user!.id),
        where('createdAt', '>=', Timestamp.fromDate(startDate))
      );
      const responsesSnapshot = await getDocs(responsesQuery);
      const responses = responsesSnapshot.docs.map(doc => doc.data());

      const quotesSubmitted = responses.length;
      const quotesAccepted = responses.filter(r => r.status === 'accepted').length;
      const conversionRate = quotesSubmitted > 0 ? (quotesAccepted / quotesSubmitted) * 100 : 0;

      // Get completed escrow transactions for revenue
      const escrowQuery = query(
        collection(db, 'escrowTransactions'),
        where('vendorId', '==', user!.id),
        where('status', '==', 'released'),
        where('releasedAt', '>=', Timestamp.fromDate(startDate))
      );
      const escrowSnapshot = await getDocs(escrowQuery);
      const escrowTransactions = escrowSnapshot.docs.map(doc => doc.data());

      const totalRevenue = escrowTransactions.reduce((sum, tx) => sum + tx.vendorAmount, 0);
      const totalTransactions = escrowTransactions.length;
      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Get pending earnings
      const pendingEscrowQuery = query(
        collection(db, 'escrowTransactions'),
        where('vendorId', '==', user!.id),
        where('status', '==', 'held')
      );
      const pendingSnapshot = await getDocs(pendingEscrowQuery);
      const pendingEarnings = pendingSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().vendorAmount,
        0
      );

      // Get reviews
      const reviewsQuery = query(
        collection(db, 'enhancedReviews'),
        where('revieweeId', '==', user!.id),
        where('status', '==', 'published')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());

      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      const ratingCounts = {
        five: reviews.filter(r => r.rating === 5).length,
        four: reviews.filter(r => r.rating === 4).length,
        three: reviews.filter(r => r.rating === 3).length,
        two: reviews.filter(r => r.rating === 2).length,
        one: reviews.filter(r => r.rating === 1).length,
      };

      // Calculate popular categories
      const categoryCount: { [key: string]: number } = {};
      responses.forEach(r => {
        // Get request to find category
        categoryCount[r.category || 'Other'] = (categoryCount[r.category || 'Other'] || 0) + 1;
      });

      const popularCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        quotesViewed: quotesSubmitted * 2, // Estimate
        quotesSubmitted,
        quotesAccepted,
        conversionRate,
        totalRevenue,
        averageOrderValue,
        totalTransactions,
        pendingEarnings,
        averageResponseTime: 45, // Placeholder - calculate from actual data
        responseRate: 95, // Placeholder
        profileViews: quotesSubmitted * 3, // Estimate
        averageRating,
        totalReviews,
        fiveStarCount: ratingCounts.five,
        fourStarCount: ratingCounts.four,
        threeStarCount: ratingCounts.three,
        twoStarCount: ratingCounts.two,
        oneStarCount: ratingCounts.one,
        popularCategories,
        topLocations: [], // Placeholder
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
              {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Year'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Total Revenue</Text>
        <Text style={styles.revenueAmount}>₦{analytics.totalRevenue.toLocaleString()}</Text>
        <View style={styles.revenueStats}>
          <View style={styles.revenueStat}>
            <Text style={styles.revenueStatLabel}>Pending</Text>
            <Text style={styles.revenueStatValue}>₦{analytics.pendingEarnings.toLocaleString()}</Text>
          </View>
          <View style={styles.revenueStat}>
            <Text style={styles.revenueStatLabel}>Avg. Order</Text>
            <Text style={styles.revenueStatValue}>₦{analytics.averageOrderValue.toLocaleString()}</Text>
          </View>
          <View style={styles.revenueStat}>
            <Text style={styles.revenueStatLabel}>Orders</Text>
            <Text style={styles.revenueStatValue}>{analytics.totalTransactions}</Text>
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <Text style={styles.sectionTitle}>Performance</Text>
      <View style={styles.statsGrid}>
        {renderStatCard('Quotes Submitted', analytics.quotesSubmitted, '📝', '#667eea')}
        {renderStatCard('Quotes Accepted', analytics.quotesAccepted, '✅', '#4caf50')}
        {renderStatCard('Conversion Rate', `${analytics.conversionRate.toFixed(1)}%`, '📈', '#ff9800')}
        {renderStatCard('Profile Views', analytics.profileViews, '👁', '#9c27b0')}
      </View>

      {/* Engagement */}
      <Text style={styles.sectionTitle}>Engagement</Text>
      <View style={styles.statsGrid}>
        {renderStatCard('Response Time', `${analytics.averageResponseTime} min`, '⚡', '#00bcd4')}
        {renderStatCard('Response Rate', `${analytics.responseRate}%`, '💬', '#4caf50')}
      </View>

      {/* Ratings */}
      <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
      <View style={styles.ratingsCard}>
        <View style={styles.ratingsHeader}>
          <View style={styles.ratingsOverall}>
            <Text style={styles.ratingsAverage}>{analytics.averageRating.toFixed(1)}</Text>
            <Text style={styles.ratingsStars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.ratingsCount}>{analytics.totalReviews} reviews</Text>
          </View>

          <View style={styles.ratingsBreakdown}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                rating === 5
                  ? analytics.fiveStarCount
                  : rating === 4
                  ? analytics.fourStarCount
                  : rating === 3
                  ? analytics.threeStarCount
                  : rating === 2
                  ? analytics.twoStarCount
                  : analytics.oneStarCount;

              const percentage =
                analytics.totalReviews > 0 ? (count / analytics.totalReviews) * 100 : 0;

              return (
                <View key={rating} style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>{rating}★</Text>
                  <View style={styles.ratingBar}>
                    <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.ratingCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Popular Categories */}
      {analytics.popularCategories.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.categoriesCard}>
            {analytics.popularCategories.map((cat, index) => (
              <View key={index} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{cat.category}</Text>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${
                          (cat.count / analytics.popularCategories[0].count) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Insights */}
      <Text style={styles.sectionTitle}>Insights</Text>
      <View style={styles.insightsCard}>
        <View style={styles.insightItem}>
          <Text style={styles.insightIcon}>💡</Text>
          <Text style={styles.insightText}>
            Your conversion rate is {analytics.conversionRate > 30 ? 'excellent' : 'good'}. Keep providing
            competitive quotes!
          </Text>
        </View>
        {analytics.averageResponseTime > 60 && (
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>⚠️</Text>
            <Text style={styles.insightText}>
              Try to respond faster. Vendors who respond within 30 minutes win 2x more jobs.
            </Text>
          </View>
        )}
        {analytics.averageRating < 4.0 && analytics.totalReviews > 5 && (
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>📈</Text>
            <Text style={styles.insightText}>
              Focus on improving service quality to boost your rating above 4.0 stars.
            </Text>
          </View>
        )}
      </View>

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
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#667eea',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  revenueCard: {
    backgroundColor: '#667eea',
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revenueStat: {
    alignItems: 'center',
  },
  revenueStatLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 4,
  },
  revenueStatValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 11,
    color: '#999',
  },
  ratingsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  ratingsHeader: {
    flexDirection: 'row',
    gap: 20,
  },
  ratingsOverall: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  ratingsAverage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingsStars: {
    fontSize: 16,
    marginVertical: 5,
  },
  ratingsCount: {
    fontSize: 12,
    color: '#999',
  },
  ratingsBreakdown: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ratingLabel: {
    fontSize: 13,
    color: '#666',
    width: 25,
  },
  ratingBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#ff9800',
    borderRadius: 3,
  },
  ratingCount: {
    fontSize: 12,
    color: '#999',
    width: 30,
    textAlign: 'right',
  },
  categoriesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    width: 120,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    width: 30,
    textAlign: 'right',
  },
  insightsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default VendorAnalyticsScreen;
