import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
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
  const { user } = useAuth();
  const { formatAmount } = usePrivacy();
  const isMoneyIn = type === 'in';
  const accentColor = isMoneyIn ? '#22C55E' : '#EF4444';
  const TrendIcon = isMoneyIn ? ArrowUpRight : ArrowDownRight;

  const content = (
    <LinearGradient
      colors={['#111111', '#050505']}
      style={[styles.card, style]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}12` }]}>
          <TrendIcon size={14} color={accentColor} strokeWidth={3} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
        {formatAmount(value, user?.currency)}
      </Text>

      <View style={styles.footer}>
        {trend && trendValue ? (
          <View style={styles.trendRow}>
            <Text style={[styles.trendValue, { color: accentColor }]}>{trendValue}</Text>
            <Text style={styles.trendLabel}>vs last</Text>
          </View>
        ) : (
          <Text style={styles.trendLabel}>This month</Text>
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
    borderColor: 'rgba(255,255,255,0.06)',
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
    color: '#999999',
    letterSpacing: 0.3,
  },
  amount: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
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
    color: '#444444',
    fontFamily: Fonts.medium,
  },
});

export default StatCard;
