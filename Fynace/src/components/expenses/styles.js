import { StyleSheet, Platform } from 'react-native';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

// Platform-specific values
const addCategoryCancelButtonBg = Platform.select({
  android: '#1A1A1A', // Higher contrast for Android 14+
  ios: '#121212',
});
const addCategoryCancelButtonBorderWidth = Platform.select({
  android: 1,
  ios: 0,
});
const addCategoryCancelButtonBorderColor = Platform.select({
  android: '#808080',
  ios: 'transparent',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingBottom: 120, // Increased to prevent items from being hidden at the bottom
    gap: themeAssets.spacing[3],
  },
  listHeader: {
    gap: themeAssets.spacing[3],
  },
  summaryCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[3],
  },
  summaryTitle: {
    color: '#FFFFFF',
  },
  summaryAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d3d3ff',
    backgroundColor: 'transparent',
  },
  summaryAddButtonText: {
    color: '#d3d3ff',
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
    color: '#FFFFFF',
    fontFamily: Fonts.semibold,
  },
  summaryGeneric: {
    color: themeAssets.palette.text,
    fontFamily: Fonts.regular,
  },
  comparisonCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[2],
  },
  comparisonLabel: {
    flex: 1,
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
    fontFamily: Fonts.regular,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  expenseItem: {
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
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
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginLeft: 8,
  },
  expenseAmount: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontFamily: Fonts.semibold,
  },
  expenseSubtitle: {
    color: '#808080',
    fontFamily: Fonts.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: themeAssets.spacing[6],
    gap: themeAssets.spacing[2],
  },
  emptyTitle: {
    fontFamily: Fonts.semibold,
    color: '#FFFFFF',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#808080',
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
    backgroundColor: '#d3d3ff',
    borderWidth: 1,
    borderColor: '#d3d3ff',
  },
  emptyButtonText: {
    color: '#FFFFFF',
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
    backgroundColor: '#121212',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorTitle: {
    marginBottom: themeAssets.spacing[1],
    color: '#FFFFFF',
  },
  errorText: {
    marginBottom: themeAssets.spacing[1],
    color: '#808080',
  },
  skeletonBase: {
    borderRadius: 12,
    backgroundColor: '#121212',
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
    backgroundColor: '#d3d3ff',
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
    backgroundColor: '#121212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    padding: themeAssets.spacing[4],
    gap: themeAssets.spacing[3],
    minHeight: 72,
  },
  actionMenuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuTextContainer: {
    flex: 1,
    gap: 4,
  },
  actionMenuTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  actionMenuSubtitle: {
    color: '#808080',
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
    color: '#808080',
    fontSize: 14,
    fontFamily: Fonts.semibold,
    marginBottom: themeAssets.spacing[1],
  },
  monthPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  monthPickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  monthPickerPlaceholder: {
    color: '#808080',
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
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  monthPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  monthPickerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  monthPickerCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  monthPickerCloseText: {
    color: '#d3d3ff',
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
    borderBottomColor: '#1A1A1A',
  },
  monthPickerItemSelected: {
    backgroundColor: '#000000',
  },
  monthPickerItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  monthPickerItemTextSelected: {
    color: '#d3d3ff',
    fontFamily: Fonts.semibold,
  },
  monthPickerCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d3d3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerCheckmarkText: {
    color: '#FFFFFF',
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
    borderBottomColor: '#1A1A1A',
  },
  addCategoryButtonText: {
    color: '#d3d3ff',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  addCategoryContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    gap: 12,
  },
  addCategoryInput: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
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
    backgroundColor: addCategoryCancelButtonBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: addCategoryCancelButtonBorderWidth,
    borderColor: addCategoryCancelButtonBorderColor,
  },
  addCategorySaveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#d3d3ff',
  },
  addCategorySaveButtonDisabled: {
    opacity: 0.5,
  },
  addCategorySaveText: {
    color: '#000000',
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
    color: '#808080',
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
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: themeAssets.spacing[2],
  },
  filterSheetItemSelected: {
    backgroundColor: '#000000',
    borderColor: '#d3d3ff',
  },
  filterSheetItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  filterSheetItemTextSelected: {
    color: '#d3d3ff',
    fontFamily: Fonts.semibold,
  },
  filterSheetCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d3d3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSheetCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  loadMoreContainer: {
    paddingVertical: themeAssets.spacing[4],
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#808080',
    fontSize: 14,
  },
  dateHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
    marginTop: themeAssets.spacing[2],
  },
  dateHeaderText: {
    color: '#808080',
    fontSize: 13,
    fontFamily: Fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deleteContent: {
    paddingVertical: themeAssets.spacing[2],
    gap: themeAssets.spacing[4],
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeAssets.spacing[3],
    marginBottom: themeAssets.spacing[1],
  },
  deleteIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 20,
    color: '#EF4444',
    fontFamily: Fonts.bold,
  },
  deleteMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
  },
  deleteDetails: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: themeAssets.spacing[4],
    borderWidth: 1,
    borderColor: '#1A1A1A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteAmount: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
  },
  deleteCategoryChip: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  deleteCategoryText: {
    color: '#808080',
  },
  deleteWarning: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: themeAssets.spacing[3],
    marginTop: themeAssets.spacing[2],
  },
  deleteCancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  typeFilterItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  deleteConfirmButton: {
    flex: 1,
    borderRadius: 12,
  },
});

export default styles;
