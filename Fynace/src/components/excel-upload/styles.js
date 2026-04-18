import { StyleSheet } from 'react-native';
import { themeAssets } from '../../theme';
import Fonts from '../../../assets/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Fonts.semibold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  centeredSubtitle: {
    color: '#808080',
    textAlign: 'center',
  },
  uploadSection: {
    marginTop: themeAssets.spacing[4],
  },
  uploadCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  uploadCardContent: {
    alignItems: 'center',
    paddingVertical: themeAssets.spacing[6],
    gap: themeAssets.spacing[3],
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    marginTop: themeAssets.spacing[2],
  },
  uploadSubtitle: {
    color: '#808080',
    textAlign: 'center',
  },
  uploadNote: {
    color: '#808080',
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
    color: '#FFFFFF',
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
    color: '#808080',
    fontFamily: Fonts.medium,
  },
  changeFileButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  changeFileText: {
    color: '#d3d3ff',
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  errorCard: {
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
  },
  dataRow: {
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
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
    color: '#FFFFFF',
    fontFamily: Fonts.semibold,
  },
  rowDetails: {
    color: '#808080',
  },
  rowNotes: {
    color: '#808080',
    fontStyle: 'italic',
  },
  rowAmount: {
    color: '#22C55E',
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
    backgroundColor: '#000000',
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
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  cancelButton: {
    flex: 1,
    minWidth: 100,
  },
});

export default styles;
