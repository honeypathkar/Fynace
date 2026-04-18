import { StyleSheet } from 'react-native';
import Fonts from '../../../assets/fonts';
import { themeAssets } from '../../theme';

const { palette } = themeAssets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: {
    color: palette.text,
    fontFamily: Fonts.bold,
  },
  subtitle: {
    color: palette.subtext,
    fontFamily: Fonts.regular,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 6,
    paddingBottom: 100,
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#0A0A0A',
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  balanceLabel: {
    fontSize: 14,
    color: palette.subtext,
    fontFamily: Fonts.medium,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    color: palette.text,
    fontFamily: Fonts.bold,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statLabel: {
    color: palette.subtext,
    marginBottom: 8,
    fontFamily: Fonts.regular,
  },
  statValueIn: {
    color: palette.text,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  statValueOut: {
    color: palette.text,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendTextIn: {
    color: palette.success,
    fontSize: 12,
  },
  trendTextOut: {
    color: palette.error,
    fontSize: 12,
  },
  chartCard: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 5,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  sectionTitle: {
    color: palette.text,
    marginBottom: 16,
    paddingHorizontal: 15,
    fontFamily: Fonts.semibold,
    paddingTop: 5,
  },
  netBalance: {
    color: palette.text,
    fontFamily: Fonts.bold,
    marginBottom: 20,
    paddingHorizontal: 15,
    textAlign: 'left',
  },
  netBalanceLabel: {
    color: palette.subtext,
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlign: 'left',
  },
  chartWrapper: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: palette.surfaceVariant,
  },
  chart: {
    borderRadius: 16,
    fontFamily: Fonts.regular,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  categoryList: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  categoryScrollView: {
    maxHeight: 300,
  },
  categoryScrollContent: {
    gap: 12,
    paddingRight: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    color: palette.subtext,
    fontFamily: Fonts.regular,
    flex: 1,
  },
  categoryAmount: {
    color: palette.text,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  categoryPercentage: {
    color: palette.subtext,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredTitle: {
    color: palette.text,
    marginBottom: 8,
  },
  centeredSubtitle: {
    color: palette.subtext,
    textAlign: 'center',
  },
  placeholderText: {
    color: palette.subtext,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  chartPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderSubtext: {
    color: palette.placeholder,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

export default styles;
