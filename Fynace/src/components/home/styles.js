import { StyleSheet } from 'react-native';
import Fonts from '../../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    color: '#F8FAFC',
    fontFamily: Fonts.bold,
  },
  subtitle: {
    color: '#94A3B8',
    fontFamily: Fonts.regular,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 100,
    gap: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    color: '#94A3B8',
    marginBottom: 8,
    fontFamily: Fonts.regular,
  },
  statValueIn: {
    color: '#F8FAFC',
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  statValueOut: {
    color: '#F8FAFC',
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendTextIn: {
    color: '#22C55E',
    fontSize: 12,
  },
  trendTextOut: {
    color: '#EF4444',
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
    color: '#F8FAFC',
    marginBottom: 16,
    paddingHorizontal: 15,
    fontFamily: Fonts.semibold,
    paddingTop: 5,
  },
  netBalance: {
    color: '#F8FAFC',
    fontFamily: Fonts.bold,
    marginBottom: 20,
    paddingHorizontal: 15,
    textAlign: 'left',
  },
  netBalanceLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlign: 'left',
  },
  chartWrapper: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  chart: {
    marginLeft: -20,
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
    color: '#94A3B8',
    fontFamily: Fonts.regular,
    flex: 1,
  },
  categoryAmount: {
    color: '#F8FAFC',
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  categoryPercentage: {
    color: '#94A3B8',
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
    color: '#F8FAFC',
    marginBottom: 8,
  },
  centeredSubtitle: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  placeholderText: {
    color: '#94A3B8',
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
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

export default styles;
