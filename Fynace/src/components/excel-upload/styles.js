import { StyleSheet } from 'react-native';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

export const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: Fonts.semibold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingBottom: themeAssets.spacing[2],
    paddingTop: themeAssets.spacing[3],
  },
  scrollContentWithButtons: {
    paddingBottom: 100, // Space for fixed buttons
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredTitle: {
    color: theme.colors.text,
    marginBottom: 8,
  },
  centeredSubtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  uploadSection: {
    marginTop: themeAssets.spacing[4],
  },
  uploadCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  uploadCardContent: {
    alignItems: 'center',
    paddingVertical: themeAssets.spacing[6],
    gap: themeAssets.spacing[3],
  },
  uploadTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.bold,
    marginTop: themeAssets.spacing[2],
  },
  uploadSubtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  uploadNote: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  uploadButton: {
    marginTop: themeAssets.spacing[2],
    minWidth: 200,
  },
  dataSection: {
    marginTop: themeAssets.spacing[2],
    gap: themeAssets.spacing[3],
  },
  pageTitle: {
    color: theme.colors.text,
    fontFamily: Fonts.bold,
    fontSize: 24,
    marginBottom: themeAssets.spacing[3],
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeAssets.spacing[2],
  },
  dataTitle: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: Fonts.medium,
  },
  changeFileButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  changeFileText: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  errorCard: {
    backgroundColor: theme.colors.errorContainer,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
  },
  dataRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    marginBottom: themeAssets.spacing[2],
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowInfo: {
    flex: 1,
    gap: 4,
  },
  rowItemName: {
    color: theme.colors.text,
    fontFamily: Fonts.semibold,
  },
  rowDetails: {
    color: theme.colors.onSurfaceVariant,
  },
  rowNotes: {
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  rowAmount: {
    color: theme.colors.secondary,
    fontFamily: Fonts.bold,
    marginTop: 4,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editForm: {
    gap: themeAssets.spacing[3],
  },
  editActions: {
    flexDirection: 'row',
    gap: themeAssets.spacing[2],
    justifyContent: 'flex-end',
    marginTop: themeAssets.spacing[2],
  },
  editButton: {
    flex: 1,
    minWidth: 100,
  },
  fixedBottomActions: {
    flexDirection: 'row',
    gap: themeAssets.spacing[2],
    paddingHorizontal: themeAssets.spacing[5],
    paddingVertical: themeAssets.spacing[4],
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  cancelButton: {
    flex: 1,
    minWidth: 100,
  },
});

export default getStyles;
