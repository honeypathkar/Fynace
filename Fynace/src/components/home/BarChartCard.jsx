import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  InteractionManager,
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

const BarChartCard = ({ 
  title, 
  rawExpenses = [], 
  rawMoneyIn = [],
  categories = [], 
  totalIncome = 0, 
  onFilterPress, 
  granularity = 'monthly', 
  filterType, 
  filterValue,
  activeType = 'expense',
  onTypeChange,
  onSelectPeriod,
  onCategoryPress
}) => {
  const { user } = useAuth();
  const { formatAmount, isPrivacyMode } = usePrivacy();
  const theme = useTheme();
  const scrollRef = useRef(null);
  
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const getLocalDayKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const currentDayKey = getLocalDayKey(now);
  const [localSelectedKey, setLocalSelectedKey] = useState(granularity === 'daily' ? currentDayKey : currentMonthKey);

  // Notify parent of initial selection
  useEffect(() => {
    if (onSelectPeriod) onSelectPeriod(localSelectedKey);
  }, []);

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
        items.push({ 
          label: curr.getDate().toString(), 
          fullLabel: `${curr.getDate()} ${MONTH_NAMES[curr.getMonth()]}`, 
          key: getLocalDayKey(curr) 
        });
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
    const incomeTotals = {};
    const sourceData = activeType === 'expense' ? rawExpenses : rawMoneyIn;
    const targetRefData = activeType === 'expense' ? rawMoneyIn : rawExpenses; // For percentage base
    
    sourceData.forEach(exp => {
      const k = (granularity === 'daily' || filterType?.includes('week')) ? getLocalDayKey(exp.date) : exp.month;
      totals[k] = (totals[k] || 0) + (exp.amountRupees || 0);
    });

    targetRefData.forEach(exp => {
      const k = (granularity === 'daily' || filterType?.includes('week')) ? getLocalDayKey(exp.date) : exp.month;
      // Only include in refTotals if this key is part of the current items range
      if (items.some(item => item.key === k)) {
        incomeTotals[k] = (incomeTotals[k] || 0) + (exp.amountRupees || 0);
      }
    });

    // Filter items to only show those with data
    const filteredItems = items.filter(item => {
      return (totals[item.key] || 0) > 0 || (incomeTotals[item.key] || 0) > 0;
    });

    const values = filteredItems.map(item => totals[item.key] || 0);
    const max = Math.max(...values, 1);
    
    // Calculate average only from non-zero values to reflect actual spending days
    const nonZeroValues = values.filter(v => v > 0);
    const avg = nonZeroValues.reduce((a, b) => a + b, 0) / (nonZeroValues.length || 1);
    
    return { 
      items: filteredItems, 
      values, 
      max, 
      avg, 
      periodIncome: totals,
      refTotals: incomeTotals
    };
  }, [rawExpenses, rawMoneyIn, granularity, filterType, filterValue, activeType]);

  const activeIdx = processedData.items.findIndex(item => item.key === localSelectedKey);
  const displayIdx = activeIdx >= 0 ? activeIdx : (processedData.items.length - 1);
  const displayItem = processedData.items[displayIdx];
  const displayAmount = processedData.values[displayIdx];
  
  // Percentage base logic:
  // If granularity is 'daily', we want the base to be the WHOLE MONTH's total, not just that day.
  const periodBaseTotal = useMemo(() => {
    if (!displayItem) return 0;
    if (granularity === 'daily' || filterType?.includes('week')) {
      // Sum up all refTotals for this view
      return Object.values(processedData.refTotals).reduce((sum, v) => sum + v, 0);
    }
    return processedData.refTotals[displayItem.key] || 0;
  }, [displayItem, granularity, filterType, processedData.refTotals]);

  // Auto-select last bar when data changes
  useEffect(() => {
    if (processedData.items.length > 0) {
      const lastKey = processedData.items[processedData.items.length - 1].key;
      setLocalSelectedKey(lastKey);
      if (onSelectPeriod) onSelectPeriod(lastKey);
    }
  }, [processedData.items]);

  useEffect(() => {
    if (displayIdx >= 0 && scrollRef.current) {
      scrollRef.current?.scrollTo({
        x: displayIdx * fullColumnWidth - 60,
        animated: true,
      });
    }
  }, [displayIdx]); // Only when selection changes

  const animations = useRef({}).current;
  const categoryAnimations = useRef({}).current;

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      processedData.items.forEach((item, idx) => {
        const val = processedData.values[idx];
        const heightPercent = val === 0 ? 0 : Math.max((val / (processedData.max * 1.15)) * 100, 4);
        
        if (!animations[item.key]) {
          animations[item.key] = new Animated.Value(0);
        }
        
        Animated.timing(animations[item.key], {
          toValue: heightPercent,
          duration: 600,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: false,
        }).start();
      });
    });
    return () => task.cancel();
  }, [processedData.items, processedData.values, activeType]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      categories.forEach((cat, idx) => {
        const percent = periodBaseTotal > 0 ? (cat.totalMoneyOut / periodBaseTotal) * 100 : 0;
        const targetWidth = Math.min(percent, 100);
        
        if (!categoryAnimations[cat.category]) {
          categoryAnimations[cat.category] = new Animated.Value(0);
        }
        
        Animated.timing(categoryAnimations[cat.category], {
          toValue: targetWidth,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }).start();
      });
    });
    return () => task.cancel();
  }, [categories, periodBaseTotal]);

  const styles = useMemo(() => StyleSheet.create({
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
    progressTrack: { height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceVariant },
    progressBar: { height: '100%', borderRadius: 4 },
    noDataText: { textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
    typeSwitchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 20,
    },
    typeTab: {
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.elevation.level1,
    },
    typeTabText: {
      fontSize: 13,
      fontFamily: Fonts.medium,
    },
  }), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.avgHeaderLabel, { color: theme.colors.secondary }]}>
            Average: {formatAmount(processedData.avg, user?.currency, { compact: true })}
          </Text>
        </View>
        <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
          <FilterIcon size={20} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.monthText, { color: theme.colors.onSurfaceVariant }]}>{displayItem?.fullLabel}</Text>
        <Text style={[styles.amountText, { color: theme.colors.text }]}>
          {isPrivacyMode ? '******' : formatAmount(displayAmount, user?.currency)}
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
                { bottom: 50 + (processedData.avg / (processedData.max * 1.15)) * 130 },
              ]}
            >
              <View style={[styles.dashedLine, { borderColor: theme.colors.secondary }]} />
            </View>

            {processedData.items.map((item, index) => {
              const val = processedData.values[index];
              const isSelected = item.key === localSelectedKey;
              const heightAnim = animations[item.key] || new Animated.Value(0);

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.7}
                  onPress={() => {
                    setLocalSelectedKey(item.key);
                    if (onSelectPeriod) onSelectPeriod(item.key);
                  }}
                  style={[styles.barColumn, { width: barWidth, marginHorizontal: barMargin }]}
                >
                  <View style={[styles.barTrack, { width: barWidth, backgroundColor: 'transparent' }]}>
                    <Animated.Text 
                      style={[
                        styles.barValue, 
                        { 
                          color: isSelected ? theme.colors.text : theme.colors.onSurfaceVariant,
                          bottom: heightAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['2%', '102%']
                          }),
                          position: 'absolute',
                          width: 80,
                          textAlign: 'center',
                          left: (barWidth - 80) / 2
                        }
                      ]}
                    >
                      {isPrivacyMode ? '***' : formatK(val)}
                    </Animated.Text>
                    
                    <Animated.View style={{ 
                      height: heightAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      }),
                      width: '100%',
                      overflow: 'hidden',
                      borderRadius: 20,
                    }}>
                      <LinearGradient
                        colors={isSelected 
                          ? [theme.colors.chartPrimary, theme.colors.chartSecondary] 
                          : theme.dark 
                            ? [theme.colors.placeholder, theme.colors.outlineVariant]
                            : [theme.colors.surfaceVariant, theme.colors.outline]}
                        style={{ flex: 1 }}
                      />
                    </Animated.View>
                  </View>

                  <Text
                    style={[
                      styles.barLabel,
                      { color: isSelected ? theme.colors.text : theme.colors.onSurfaceVariant },
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

      <View style={styles.typeSwitchContainer}>
        {granularity !== 'daily' && !filterType?.includes('week') && ['expense', 'income'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => onTypeChange && onTypeChange(t)}
            style={[
              styles.typeTab,
              activeType === t && { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary }
            ]}
          >
            <Text style={[
              styles.typeTabText, 
              { color: activeType === t ? theme.colors.onSecondary : theme.colors.onSurfaceVariant },
              activeType === t && { color: theme.colors.onSecondary, fontFamily: Fonts.bold }
            ]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.categoriesSection}>
        <Text style={[styles.categoriesTitle, { color: theme.colors.text }]}>
          {activeType === 'expense' ? 'Spend Categories' : 'Income Categories'}
        </Text>
        {categories.length > 0 ? (
          categories.map((cat, index) => {
            // Using total income (or total expense if activeType is income) for the percentage
            const percent = periodBaseTotal > 0 ? (cat.totalMoneyOut / periodBaseTotal) * 100 : 0;
            const { emoji, color } = getCategoryConfig(cat.category, index);
            const widthAnim = categoryAnimations[cat.category] || new Animated.Value(0);

            return (
              <TouchableOpacity 
                key={index} 
                style={styles.categoryItem}
                onPress={() => onCategoryPress && onCategoryPress(cat.category)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={styles.categoryEmoji}>{emoji}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.categoryName, { color: theme.colors.text }]}>{cat.category}</Text>
                      <Text style={[styles.categoryPercent, { color: theme.colors.onSurfaceVariant }]}>
                        {percent.toFixed(1)}% of {activeType === 'expense' ? 'income' : 'expenses'}
                      </Text>
                    </View>
                    <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>{formatAmount(cat.totalMoneyOut, user?.currency)}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <Animated.View style={[
                      styles.progressBar, 
                      { 
                        width: widthAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%']
                        }), 
                        backgroundColor: color 
                      }
                    ]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={[styles.noDataText, { color: theme.colors.onSurfaceVariant }]}>
            No {activeType}s for this period
          </Text>
        )}
      </View>
    </View>
  );
};

export default React.memo(BarChartCard);
