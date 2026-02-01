import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import styles from './styles';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../hooks/useAuth';

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
  const TrendIcon = isMoneyIn ? TrendingUp : TrendingDown;
  const trendColor = isMoneyIn ? '#22C55E' : '#EF4444';
  const valueStyle = isMoneyIn ? styles.statValueIn : styles.statValueOut;
  const trendTextStyle = isMoneyIn ? styles.trendTextIn : styles.trendTextOut;

  const content = (
    <LinearGradient
      colors={['#1E293B', '#0F172A']}
      style={[styles.statCard, style]}
    >
      <Text variant="bodyMedium" style={styles.statLabel}>
        {label}
      </Text>
      <Text variant="titleLarge" style={valueStyle}>
        {formatAmount(value, user?.currency)}
      </Text>
      {trend && (
        <View style={styles.trendRow}>
          <TrendIcon size={16} color={trendColor} />
          <Text style={trendTextStyle}>{trendValue}</Text>
        </View>
      )}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
};

export default StatCard;
