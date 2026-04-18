import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../hooks/useAuth';
import Fonts from '../../../assets/fonts';

const StatCard = ({
  label,
  value,
  trend,
  trendValue,
  type,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { formatAmount } = usePrivacy();
  const isMoneyIn = type === 'in';
  const accentColor = isMoneyIn ? theme.colors.success : theme.colors.error;
  const TrendIcon = isMoneyIn ? ArrowUpRight : ArrowDownRight;

  const content = (
    <LinearGradient
      colors={theme.dark
        ? [theme.colors.surface, theme.colors.elevation.level1]
        : [theme.colors.outlineVariant, theme.colors.surfaceVariant]}
      style={[
        styles.card,
        {
          borderColor: theme.colors.outlineVariant,
        },
        style
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}12` }]}>
          <TrendIcon size={14} color={accentColor} strokeWidth={3} />
        </View>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      </View>
 
      <Text style={[styles.amount, { color: theme.colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {formatAmount(value, user?.currency)}
      </Text>
 
      <View style={styles.footer}>
        {trend && trendValue ? (
          <View style={styles.trendRow}>
            <Text style={[styles.trendValue, { color: accentColor }]}>{trendValue}</Text>
            <Text style={[styles.trendLabel, { color: theme.colors.onSurfaceVariant }]}>vs last</Text>
          </View>
        ) : (
          <Text style={[styles.trendLabel, { color: theme.colors.onSurfaceVariant }]}>This month</Text>
        )}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ flex: 1 }}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={{ flex: 1 }}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    letterSpacing: 0.3,
  },
  amount: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    marginVertical: 4,
  },
  footer: {
    marginTop: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendValue: {
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  trendLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
});

export default StatCard;
