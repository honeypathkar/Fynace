import { StyleSheet, Platform } from 'react-native';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingBottom: themeAssets.spacing[6],
    gap: themeAssets.spacing[3],
    marginBottom: 50,
  },
  listHeader: {
    gap: themeAssets.spacing[3],
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[3],
  },
  summaryTitle: {
    color: '#F8FAFC',
  },
  summaryAddButton: {
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
  summaryAddButtonText: {
    color: '#3A6FF8',
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeAssets.spacing[4],
  },
  summaryItem: {
    width: '45%',
  },
  summaryLabel: {
    color: themeAssets.palette.subtext,
    fontFamily: Fonts.regular,
  },
  summaryValueIn: {
    color: themeAssets.palette.success,
    fontFamily: Fonts.semibold,
  },
  summaryValueOut: {
    color: themeAssets.palette.error,
    fontFamily: Fonts.semibold,
  },
  summaryValueRemaining: {
    color: themeAssets.palette.primary,
    fontFamily: Fonts.semibold,
  },
  summaryGeneric: {
    color: themeAssets.palette.text,
    fontFamily: Fonts.regular,
  },
  comparisonCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[2],
  },
  comparisonLabel: {
    flex: 1,
    color: '#F8FAFC',
  },
  comparisonValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeAssets.spacing[2],
  },
  comparisonChip: {
    alignSelf: 'flex-start',
  },
  comparisonTitle: {
    color: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    padding: 0,
    fontFamily: Fonts.regular,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButtonText: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  expenseItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: themeAssets.spacing[2],
  },
  expenseAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: themeAssets.spacing[3],
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  expenseAmount: {
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  moneyIn: {
    color: themeAssets.palette.success,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  moneyOut: {
    color: themeAssets.palette.error,
    fontFamily: Fonts.semibold,
    fontSize: 14,
  },
  expenseNotes: {
    color: themeAssets.palette.subtext,
    fontFamily: Fonts.regular,
  },
  expenseTitle: {
    color: '#F8FAFC',
    fontFamily: Fonts.semibold,
  },
  expenseSubtitle: {
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: themeAssets.spacing[6],
    gap: themeAssets.spacing[2],
  },
  emptyTitle: {
    fontFamily: Fonts.semibold,
    color: '#F8FAFC',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#94A3B8',
    paddingHorizontal: themeAssets.spacing[5],
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: themeAssets.spacing[2],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#3A6FF8',
    borderWidth: 1,
    borderColor: '#3A6FF8',
  },
  emptyButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: Fonts.semibold,
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
  errorCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorTitle: {
    marginBottom: themeAssets.spacing[1],
    color: '#F8FAFC',
  },
  errorText: {
    marginBottom: themeAssets.spacing[1],
    color: '#94A3B8',
  },
  skeletonBase: {
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  skeletonContainer: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingTop: themeAssets.spacing[4],
    paddingBottom: themeAssets.spacing[6],
    gap: themeAssets.spacing[3],
  },
  skeletonTitleShort: {
    width: 120,
    height: 18,
  },
  skeletonButton: {
    width: 72,
    height: 32,
    borderRadius: 16,
  },
  skeletonLabel: {
    width: '60%',
    height: 14,
    marginBottom: themeAssets.spacing[1],
  },
  skeletonLabelWide: {
    flex: 1,
    height: 14,
  },
  skeletonValue: {
    width: '80%',
    height: 22,
  },
  skeletonChipValue: {
    width: 64,
    height: 18,
  },
  skeletonChip: {
    width: 54,
    height: 28,
    borderRadius: 14,
  },
  skeletonNotes: {
    marginTop: themeAssets.spacing[2],
    width: '90%',
    height: 16,
  },
  fabButton: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3A6FF8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  actionMenuContent: {
    paddingVertical: themeAssets.spacing[2],
    gap: themeAssets.spacing[2],
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: themeAssets.spacing[4],
    gap: themeAssets.spacing[3],
    minHeight: 72,
  },
  actionMenuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuTextContainer: {
    flex: 1,
    gap: 4,
  },
  actionMenuTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  actionMenuSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
  },
  actionMenuFooter: {
    paddingTop: themeAssets.spacing[2],
  },
  actionMenuButton: {
    minWidth: 100,
  },
  inputWrapper: {
    marginBottom: themeAssets.spacing[3],
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: Fonts.semibold,
    marginBottom: themeAssets.spacing[1],
  },
  monthPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  monthPickerText: {
    color: '#F8FAFC',
    fontSize: 16,
    flex: 1,
  },
  monthPickerPlaceholder: {
    color: '#94A3B8',
  },
  monthPickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  monthPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  monthPickerContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  monthPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  monthPickerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  monthPickerCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  monthPickerCloseText: {
    color: '#3A6FF8',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  monthPickerList: {
    paddingVertical: 8,
  },
  monthPickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  monthPickerItemSelected: {
    backgroundColor: '#0F172A',
  },
  monthPickerItemText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  monthPickerItemTextSelected: {
    color: '#3A6FF8',
    fontFamily: Fonts.semibold,
  },
  monthPickerCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3A6FF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerCheckmarkText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  addCategoryButtonText: {
    color: '#3A6FF8',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  addCategoryContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 12,
  },
  addCategoryInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 16,
  },
  addCategoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  addCategoryCancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Platform.select({
      android: '#334155', // Higher contrast for Android 14+
      ios: '#1E293B',
    }),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Platform.select({
      android: 1,
      ios: 0,
    }),
    borderColor: Platform.select({
      android: '#475569',
      ios: 'transparent',
    }),
  },
  addCategorySaveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#3A6FF8',
  },
  addCategorySaveButtonDisabled: {
    opacity: 0.5,
  },
  addCategorySaveText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  filterSheetContent: {
    paddingVertical: themeAssets.spacing[2],
    gap: themeAssets.spacing[1],
  },
  filterSheetScrollContent: {
    paddingBottom: themeAssets.spacing[4],
  },
  filterSection: {
    marginBottom: themeAssets.spacing[4],
  },
  filterSectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: Fonts.semibold,
    marginBottom: themeAssets.spacing[2],
    paddingHorizontal: themeAssets.spacing[1],
  },
  filterSheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: themeAssets.spacing[2],
  },
  filterSheetItemSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#3A6FF8',
  },
  filterSheetItemText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
  filterSheetItemTextSelected: {
    color: '#3A6FF8',
    fontFamily: Fonts.semibold,
  },
  filterSheetCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3A6FF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSheetCheckmarkText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  loadMoreContainer: {
    paddingVertical: themeAssets.spacing[4],
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});

export default styles;

