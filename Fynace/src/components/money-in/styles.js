import { StyleSheet } from 'react-native';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  listContent: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingTop: themeAssets.spacing[4],
    paddingBottom: themeAssets.spacing[6],
    gap: themeAssets.spacing[2],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A6FF8',
    backgroundColor: 'transparent',
  },
  addButtonText: {
    color: '#3A6FF8',
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  historyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: themeAssets.spacing[2],
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyInfo: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[1],
  },
  historyAmount: {
    color: '#22C55E',
    fontSize: 20,
    fontFamily: Fonts.bold,
  },
  deleteButton: {
    padding: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: themeAssets.spacing[1],
  },
  historyDate: {
    color: '#94A3B8',
    fontSize: 14,
  },
  historyNotes: {
    color: '#F8FAFC',
    fontSize: 14,
    marginTop: themeAssets.spacing[1],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: themeAssets.spacing[6],
    gap: themeAssets.spacing[2],
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  formContent: {
    gap: themeAssets.spacing[3],
  },
  formActions: {
    flexDirection: 'row',
    gap: themeAssets.spacing[2],
    justifyContent: 'flex-end',
  },
  formButton: {
    flex: 1,
    minWidth: 100,
  },
});

export default styles;

