import { StyleSheet } from 'react-native';
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
  contentWrapper: {
    flex: 1,
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
    color: '#F8FAFC',
    marginBottom: 8,
  },
  centeredSubtitle: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  uploadSection: {
    marginTop: themeAssets.spacing[4],
  },
  uploadCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  uploadCardContent: {
    alignItems: 'center',
    paddingVertical: themeAssets.spacing[6],
    gap: themeAssets.spacing[3],
  },
  uploadTitle: {
    color: '#F8FAFC',
    fontFamily: Fonts.bold,
    marginTop: themeAssets.spacing[2],
  },
  uploadSubtitle: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  uploadNote: {
    color: '#64748B',
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
    color: '#F8FAFC',
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
    color: '#94A3B8',
    fontFamily: Fonts.medium,
  },
  changeFileButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  changeFileText: {
    color: '#3A6FF8',
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  errorCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
  },
  dataRow: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#F8FAFC',
    fontFamily: Fonts.semibold,
  },
  rowDetails: {
    color: '#94A3B8',
  },
  rowNotes: {
    color: '#64748B',
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
    backgroundColor: '#0F172A',
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
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  cancelButton: {
    flex: 1,
    minWidth: 100,
  },
});

export default styles;

