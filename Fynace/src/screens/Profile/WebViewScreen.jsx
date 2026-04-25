import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Fonts from '../../../assets/fonts';

const WebViewScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const route = useRoute();
  const { url, title } = route.params;

  // Append theme mode to URL for synchronization
  const themedUrl = useMemo(() => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}theme=${theme.dark ? 'dark' : 'light'}`;
  }, [url, theme.dark]);

  const isLegalPage = title?.toLowerCase().includes('privacy') || 
                      title?.toLowerCase().includes('terms');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        source={{ uri: themedUrl }}
        style={[styles.webview, { backgroundColor: theme.colors.background }]}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator color={theme.colors.secondary} size="large" />
          </View>
        )}
        backgroundColor={theme.colors.background}
        // Disable zooming for legal pages as requested
        scalesPageToFit={!isLegalPage}
        setSupportZoom={!isLegalPage}
        builtInZoomControls={!isLegalPage}
        displayZoomControls={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WebViewScreen;
