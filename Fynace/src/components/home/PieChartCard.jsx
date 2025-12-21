import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import styles from './styles';

const PieChartCard = ({
  title,
  pieChartData,
  categoryData,
  pieColors,
  screenWidth,
  chartConfig,
}) => {
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
        item.population > 0
    );

  return (
    <View style={styles.chartCard}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      <View style={styles.donutContainer}>
        {hasValidPieData ? (
          <PieChart
            data={pieChartData}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
          />
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
        {categoryData && Array.isArray(categoryData) && categoryData.length > 0 ? (
          categoryData.slice(0, 4).map((item, index) => {
            if (!item || !item.category) return null;
            const amount = item.totalMoneyOut || item.totalAmount || 0;
            return (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: pieColors[index % pieColors.length] },
                    ]}
                  />
                  <Text style={styles.categoryName}>{item.category}</Text>
                </View>
                <Text style={styles.categoryAmount}>
                  ₹{amount.toLocaleString()}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.placeholderText}>No category data available</Text>
        )}
      </View>
    </View>
  );
};

export default PieChartCard;

