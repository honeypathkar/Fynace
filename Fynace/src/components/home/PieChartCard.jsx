import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../hooks/useAuth';

const PieChartCard = ({
  title,
  pieChartData,
  categoryData,
  pieColors,
  screenWidth,
  chartConfig,
}) => {
  const { user } = useAuth();
  const { formatAmount } = usePrivacy();
  const hasValidPieData =
    pieChartData &&
    Array.isArray(pieChartData) &&
    pieChartData.length > 0 &&
    chartConfig &&
    pieChartData.every(
      item =>
        item &&
        item.name &&
        typeof item.population === 'number' &&
        item.population > 0,
    );

  // Calculate total and percentages
  const categoryListWithPercentages = useMemo(() => {
    if (
      !categoryData ||
      !Array.isArray(categoryData) ||
      categoryData.length === 0
    ) {
      return [];
    }

    const total = categoryData.reduce((sum, item) => {
      const amount = item.totalMoneyOut || item.totalAmount || 0;
      return sum + amount;
    }, 0);

    return categoryData
      .map((item, index) => {
        const amount = item.totalMoneyOut || item.totalAmount || 0;
        const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
        return {
          ...item,
          amount,
          percentage: parseFloat(percentage),
          color: pieColors[index % pieColors.length],
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }, [categoryData, pieColors]);

  return (
    <LinearGradient
      colors={['#1E293B', '#0F172A', '#1E293B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.chartCard}
    >
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      <View style={styles.donutContainer}>
        {hasValidPieData ? (
          <View style={styles.pieChartWrapper}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 48}
              height={300}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft={((screenWidth - 48) / 4).toString()}
              absolute={false}
              hasLegend={false}
            />
          </View>
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>
              No category data available
            </Text>
            <Text style={styles.placeholderSubtext}>
              Add expenses with categories to see breakdown
            </Text>
          </View>
        )}
      </View>

      <View style={styles.categoryList}>
        {categoryListWithPercentages.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            style={styles.categoryScrollView}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categoryListWithPercentages.map((item, index) => {
              if (!item || !item.category) return null;
              return (
                <View key={index} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[styles.dot, { backgroundColor: item.color }]}
                    />
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {item.category}
                    </Text>
                  </View>
                  <View style={styles.categoryAmountContainer}>
                    <Text style={styles.categoryPercentage}>
                      {item.percentage}%
                    </Text>
                    <Text style={styles.categoryAmount}>
                      {formatAmount(item.amount, user?.currency)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.placeholderText}>No category data available</Text>
        )}
      </View>
    </LinearGradient>
  );
};

export default PieChartCard;
