import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { Filter as FilterIcon } from 'lucide-react-native';
import Fonts from '../../../assets/fonts';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../hooks/useAuth';
import { categoryConfigs, paletteColors } from '../../theme/theme';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getCategoryConfig = (name, index) => {
  const lower = (name || '').toLowerCase().trim();
  for (const [key, cfg] of Object.entries(categoryConfigs)) {
    if (lower.includes(key)) return cfg;
  }
  return { emoji: '💰', color: paletteColors[index % paletteColors.length] };
};

const BarChartCard = ({ title, rawExpenses = [], categories = [], totalIncome = 0, onFilterPress, granularity = 'monthly', filterType, filterValue }) => {
  const { user } = useAuth();
  const { formatAmount } = usePrivacy();
  const theme = useTheme();
  const scrollRef = useRef(null);
  
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentDayKey = now.toISOString().split('T')[0];

  const [localSelectedKey, setLocalSelectedKey] = useState(granularity === 'daily' ? currentDayKey : currentMonthKey);

  const barWidth = 30;
  const barMargin = (granularity === 'daily' || filterType?.includes('week')) ? 6 : 14;
  const fullColumnWidth = barWidth + (barMargin * 2);

  useEffect(() => {
    setLocalSelectedKey((granularity === 'daily' || filterType?.includes('week')) ? currentDayKey : currentMonthKey);
  }, [granularity, filterType]);

  const formatK = (val) => {
    if (val === 0) return '';
    if (val < 100) return val.toFixed(0);
    if (val < 1000) return val.toString();
    return (val / 1000).toFixed(1) + 'k';
  };

  const processedData = useMemo(() => {
    const items = [];
    const isDaily = granularity === 'daily' || filterType?.includes('week');
    
    if (isDaily) {
      let startDate;
      let endDate;
      if (filterType === 'monthly' && filterValue) {
        const [y, m] = filterValue.split('-').map(Number);
        startDate = new Date(y, m - 1, 1);
        endDate = new Date(y, m, 0);
        if (y === now.getFullYear() && (m - 1) === now.getMonth()) endDate = now;
      } else if (filterType === 'current_week') {
        const d = new Date(now);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(d.setDate(diff));
        startDate.setHours(0,0,0,0);
        endDate = now;
      } else if (filterType === 'last_week') {
        const d = new Date(now);
        const day = d.getDay();
        const diff = d.getDate() - day - 6;
        startDate = new Date(d.setDate(diff));
        startDate.setHours(0,0,0,0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
      } else {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14);
        endDate = now;
      }
      let curr = new Date(startDate);
      while (curr <= endDate) {
        items.push({ label: curr.getDate().toString(), fullLabel: `${curr.getDate()} ${MONTH_NAMES[curr.getMonth()]}`, key: curr.toISOString().split('T')[0] });
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      const monthTotals = {};
      rawExpenses.forEach(exp => { if (!exp.month) return; monthTotals[exp.month] = (monthTotals[exp.month] || 0) + (exp.amountRupees || 0); });
      let startYear, endYear, startMonth, endMonth;
      if (filterType === 'yearly' && filterValue) {
        startYear = parseInt(filterValue); endYear = startYear; startMonth = 0;
        endMonth = (startYear === now.getFullYear()) ? now.getMonth() : 11;
      } else {
        const sortedKeys = Object.keys(monthTotals).sort();
        if (sortedKeys.length > 0) { [startYear, startMonth] = sortedKeys[0].split('-').map(Number); startMonth -= 1; }
        else { startYear = now.getFullYear(); startMonth = now.getMonth(); }
        endYear = now.getFullYear(); endMonth = now.getMonth();
      }
      let currYear = startYear; let currMonth = startMonth;
      while (currYear < endYear || (currYear === endYear && currMonth <= endMonth)) {
        const d = new Date(currYear, currMonth, 1);
        const k = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`;
        const isRecent = (new Date(now.getFullYear(), now.getMonth() - 6, 1) <= d);
        if (monthTotals[k] || isRecent || (currYear === now.getFullYear() && currMonth === now.getMonth())) {
          items.push({ label: MONTH_NAMES[d.getMonth()], fullLabel: `${FULL_MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`, key: k });
        }
        currMonth++; if (currMonth > 11) { currMonth = 0; currYear++; }
      }
      if (items.length > 12 && filterType === 'all_time') items.splice(0, items.length - 12);
    }
    const totals = {};
    rawExpenses.forEach(exp => {
      const d = new Date(exp.date);
      const k = (granularity === 'daily' || filterType?.includes('week')) ? d.toISOString().split('T')[0] : exp.month;
      totals[k] = (totals[k] || 0) + (exp.amountRupees || 0);
    });
    const values = items.map(item => totals[item.key] || 0);
    const max = Math.max(...values, 1);
    const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    return { items, values, max, avg };
  }, [rawExpenses, granularity, filterType, filterValue]);

  const activeIdx = processedData.items.findIndex(item => item.key === localSelectedKey);
  const displayIdx = activeIdx >= 0 ? activeIdx : (processedData.items.length - 1);
  const displayItem = processedData.items[displayIdx];
  const displayAmount = processedData.values[displayIdx];

  useEffect(() => {
    if (displayIdx >= 0 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: displayIdx * fullColumnWidth - 60,
          animated: true,
        });
      }, 300);
    }
  }, [displayIdx, granularity]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors?.background || '#000000' }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.colors?.text || '#FFFFFF' }]}>{title}</Text>
          <Text style={[styles.avgHeaderLabel, { color: theme.colors?.secondary || '#d3d3ff' }]}>
            Average: {formatAmount(processedData.avg, user?.currency, { compact: true })}
          </Text>
        </View>
        <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
          <FilterIcon size={20} color={theme.colors?.subtext || '#808080'} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.monthText, { color: theme.colors?.subtext || '#808080' }]}>{displayItem?.fullLabel}</Text>
        <Text style={[styles.amountText, { color: theme.colors?.text || '#FFFFFF' }]}>
          {formatAmount(displayAmount, user?.currency)}
        </Text>
      </View>

      <View style={styles.chartArea}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barsScrollContent}
        >
          <View style={styles.barsContainer}>
            <View
              style={[
                styles.avgLine,
                { bottom: 20 + (processedData.avg / (processedData.max * 1.15)) * 140 },
              ]}
            >
              <View style={[styles.dashedLine, { borderColor: 'rgba(211,211,255,0.15)' }]} />
            </View>

            {processedData.items.map((item, index) => {
              const val = processedData.values[index];
              const isSelected = item.key === localSelectedKey;
              const heightPercent = val === 0 ? 0 : Math.max((val / (processedData.max * 1.15)) * 100, 4);

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.7}
                  onPress={() => setLocalSelectedKey(item.key)}
                  style={[styles.barColumn, { width: barWidth, marginHorizontal: barMargin }]}
                >
                  <View style={[styles.barTrack, { width: barWidth, backgroundColor: 'transparent' }]}>
                    <Text 
                      style={[
                        styles.barValue, 
                        { 
                          color: isSelected ? (theme.colors?.text || '#FFFFFF') : '#333333',
                          bottom: `${heightPercent + 2}%`,
                          position: 'absolute',
                          width: 80,
                          textAlign: 'center',
                          left: (barWidth - 80) / 2
                        }
                      ]}
                    >
                      {formatK(val)}
                    </Text>
                    
                    <LinearGradient
                      colors={isSelected 
                        ? ['#9B9BFF', theme.colors?.secondary || '#d3d3ff'] 
                        : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.02)']}
                      style={[styles.bar, { height: `${heightPercent}%` }]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.barLabel,
                      { color: isSelected ? (theme.colors?.text || '#FFFFFF') : (theme.colors?.subtext || '#808080') },
                      isSelected && { fontFamily: Fonts.bold },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={[styles.categoriesTitle, { color: theme.colors?.text || '#FFFFFF' }]}>Categories</Text>
        {categories.length > 0 ? (
          categories.map((cat, index) => {
            const percent = totalIncome > 0 ? (cat.totalMoneyOut / totalIncome) * 100 : 0;
            const { emoji, color } = getCategoryConfig(cat.category, index);

            return (
              <View key={index} style={styles.categoryItem}>
                <View style={[styles.categoryIconContainer, { backgroundColor: theme.colors?.surfaceVariant || '#111111' }]}>
                  <Text style={styles.categoryEmoji}>{emoji}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.categoryName, { color: theme.colors?.text || '#FFFFFF' }]}>{cat.category}</Text>
                      <Text style={[styles.categoryPercent, { color: theme.colors?.subtext || '#808080' }]}>
                        {percent.toFixed(1)}% of income
                      </Text>
                    </View>
                    <Text style={[styles.categoryAmount, { color: theme.colors?.text || '#FFFFFF' }]}>{formatAmount(cat.totalMoneyOut, user?.currency)}</Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: theme.colors?.outline || '#1A1A1A' }]}>
                    <View style={[styles.progressBar, { width: `${Math.min(percent, 100)}%`, backgroundColor: color }]} />
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={[styles.noDataText, { color: theme.colors?.subtext || '#808080' }]}>No expenses this month</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingHorizontal: 4 },
  headerTitle: { fontSize: 20, fontFamily: Fonts.medium },
  avgHeaderLabel: { fontSize: 13, fontFamily: Fonts.bold, marginTop: 2 },
  filterBtn: { padding: 4 },
  statsContainer: { alignItems: 'center', marginVertical: 24 },
  monthText: { fontSize: 15, fontFamily: Fonts.medium, marginBottom: 8 },
  amountText: { fontSize: 48, fontFamily: Fonts.bold },
  chartArea: { height: 210, marginBottom: 32 },
  barsScrollContent: { paddingHorizontal: 4 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', height: '100%', position: 'relative', paddingBottom: 24 },
  avgLine: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  dashedLine: { flex: 1, height: 1, borderWidth: 0.5, borderStyle: 'dashed' },
  barColumn: { alignItems: 'center', zIndex: 2 },
  barTrack: { height: 130, borderRadius: 20, justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' },
  bar: { width: '100%', borderRadius: 20 },
  barLabel: { fontSize: 11, marginTop: 12, fontFamily: Fonts.medium },
  barValue: { fontSize: 10, fontFamily: Fonts.medium },
  categoriesSection: { marginTop: 8 },
  categoriesTitle: { fontSize: 24, fontFamily: Fonts.bold, marginBottom: 24 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 14 },
  categoryIconContainer: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  categoryEmoji: { fontSize: 24 },
  categoryInfo: { flex: 1 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  categoryName: { fontSize: 17, fontFamily: Fonts.medium },
  categoryPercent: { fontSize: 12, marginTop: 2 },
  categoryAmount: { fontSize: 17, fontFamily: Fonts.bold },
  progressTrack: { height: 8, borderRadius: 4 },
  progressBar: { height: '100%', borderRadius: 4 },
  noDataText: { textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
});

export default BarChartCard;
