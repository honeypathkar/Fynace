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
    paddingHorizontal: 24,
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
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#F8FAFC',
    marginBottom: 8,
    fontFamily: Fonts.semibold,
  },
  netBalance: {
    color: '#F8FAFC',
    fontFamily: Fonts.bold,
    marginBottom: 20,
  },
  netBalanceLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: Fonts.regular,
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
  },
  categoryList: {
    marginTop: 20,
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    color: '#94A3B8',
    fontFamily: Fonts.regular,
  },
  categoryAmount: {
    color: '#F8FAFC',
    fontFamily: Fonts.semibold,
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

