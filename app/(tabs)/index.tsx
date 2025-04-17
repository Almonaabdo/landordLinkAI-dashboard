import React from 'react';
import { Dimensions, StyleSheet, View, ScrollView } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'react-native';
import { globalStyles } from '@/styles/globalStyles';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#2c4c9c', dark: '#2c4c9c' }}
      headerImage={
        <Image
          source={require('@/assets/images/landlordlink.png')}
          style={globalStyles.companyLogo}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Property Dashboard
        </ThemedText>

        <View style={styles.cardGrid}>
          <StatCard label="Total Buildings" value="12" />
          <StatCard label="Apartments" value="128" />
          <StatCard label="Active Tenants" value="102" />
          <StatCard label="Unpaid Rents" value="7" highlight />
          <StatCard label="Rent Collected" value="$45,200" money />
        </View>

        {/* Monthly Income Chart */}
        <View style={styles.widget}>
          <ThemedText type="default" style={styles.widgetTitle}>
            Monthly Income Overview
          </ThemedText>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June','Jule', 'August'],
              datasets: [{ data: [20000, 25000, 18000, 22000, 27000, 28000] }],
            }}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: () => '#10b981',
              labelColor: () => '#64748b',
              decimalPlaces: 0,
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#10b981',
              },
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* Occupancy Pie Chart */}
        <View style={styles.widget}>
          <ThemedText type="default" style={styles.widgetTitle}>
            Occupancy Status
          </ThemedText>
          <PieChart
            data={[
              {
                name: 'Occupied',
                population: 102,
                color: '#10b981',
                legendFontColor: '#334155',
                legendFontSize: 14,
              },
              {
                name: 'Vacant',
                population: 26,
                color: '#f87171',
                legendFontColor: '#334155',
                legendFontSize: 14,
              },
            ]}
            width={screenWidth - 48}
            height={200}
            chartConfig={{
              color: () => '#334155',
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[0, 0]}
            absolute
          />
        </View>

        {/* Rent Collection Progress */}
        <View style={styles.widget}>
          <ThemedText type="default" style={styles.widgetTitle}>
            Rent Collection Progress
          </ThemedText>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '82%' }]} />
          </View>
          <ThemedText type="default" style={styles.progressLabel}>
            82% collected
          </ThemedText>
        </View>

        {/* Mini Stats */}
        <View style={styles.miniStatsRow}>
          <MiniStat label="New Tenants" value="+12%" trend="up" />
          <MiniStat label="Vacancy Rate" value="-4%" trend="down" />
          <MiniStat label="Late Payments" value="+8%" trend="up" />
        </View>

        {/* Recent Activity */}
        <View style={styles.widget}>
          <ThemedText style={styles.widgetTitle}>Recent Activity</ThemedText>
          {[
            '💸 Rent received from Unit 304',
            '🔄 Lease renewed for Unit 102',
            '🚪 Tenant moved out of Unit 201',
          ].map((event, idx) => (
            <ThemedText key={idx} style={styles.activityItem}>
              • {event}
            </ThemedText>
          ))}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

function StatCard({
  label,
  value,
  highlight,
  money,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  money?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        highlight && styles.cardHighlight,
        money && styles.cardMoney,
      ]}
    >
      <ThemedText
        type="default"
        style={[styles.cardLabel, highlight && styles.labelHighlight]}
      >
        {label}
      </ThemedText>
      <ThemedText
        type="title"
        style={[styles.cardValue, money && styles.valueMoney]}
      >
        {value}
      </ThemedText>
    </View>
  );
}

function MiniStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: 'up' | 'down';
}) {
  return (
    <View
      style={[
        styles.miniStatCard,
        trend === 'up' ? styles.statUp : styles.statDown,
      ]}
    >
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>
        {value} {trend === 'up' ? '🔼' : '🔽'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '30%',
    minWidth: 240,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHighlight: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  cardMoney: {
    backgroundColor: '#ecfdf5',
    borderColor: '#34d399',
  },
  cardLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  labelHighlight: {
    color: '#b91c1c',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a',
  },
  valueMoney: {
    color: '#065f46',
  },
  widget: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 16,
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#475569',
  },
  activityItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  miniStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  miniStatCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statUp: {
    backgroundColor: '#ecfdf5',
    borderColor: '#34d399',
  },
  statDown: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  statLabel: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
});
