import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import GlobalHeader from '../../components/GlobalHeader';
import { useAuth } from '../../hooks/useAuth';
import { themeAssets } from '../../theme';
import { parseApiError } from '../../api/client';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, loading, logout, updateProfile } = useAuth();

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    setProfileDraft({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const handleProfileUpdate = useCallback(async () => {
    try {
      setError(null);
      setSuccess(null);
      await updateProfile(profileDraft);
      setEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message || 'Failed to update profile');
    }
  }, [profileDraft, updateProfile]);

  return (
    <View style={styles.container}>
      <GlobalHeader title="Your Space" subtitle="Manage your account and security" />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {error ? (
          <Card style={styles.feedbackCardError}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.feedbackTitle}>
                Something went wrong
              </Text>
              <Text variant="bodyMedium">{error}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {success ? (
          <Card style={styles.feedbackCardSuccess}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.feedbackTitle}>
                All set!
              </Text>
              <Text variant="bodyMedium">{success}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {!user ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.infoTitle}>
                You're not signed in
              </Text>
              <Text variant="bodyMedium" style={styles.infoSubtitle}>
                Log in or create an account to access your personalised insights.
              </Text>
              <View style={styles.buttonRow}>
                <Button mode="contained" onPress={() => navigation.navigate('Login')}>
                  Log in
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Signup')}
                  style={styles.buttonSpacing}>
                  Sign up
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.infoTitle}>
                Profile details
              </Text>
              <TextInput
                label="Full name"
                value={profileDraft.name}
                onChangeText={(value) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    name: value,
                  }))
                }
                style={styles.input}
                disabled={!editing}
              />
              <TextInput
                label="Email"
                value={profileDraft.email}
                onChangeText={(value) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    email: value,
                  }))
                }
                style={styles.input}
                disabled={!editing}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                label="Phone"
                value={profileDraft.phone}
                onChangeText={(value) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    phone: value,
                  }))
                }
                style={styles.input}
                disabled={!editing}
                keyboardType="phone-pad"
              />

              <View style={styles.buttonRow}>
                {editing ? (
                  <>
                    <Button onPress={() => setEditing(false)} mode="outlined" disabled={loading}>
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleProfileUpdate}
                      loading={loading}
                      style={styles.buttonSpacing}>
                      Save changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button mode="outlined" onPress={() => setEditing(true)}>
                      Edit profile
                    </Button>
                    <Button
                      mode="contained-tonal"
                      onPress={logout}
                      style={styles.buttonSpacing}>
                      Log out
                    </Button>
                  </>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      </Animated.View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeAssets.palette.background,
  },
  content: {
    paddingHorizontal: themeAssets.spacing[5],
    paddingBottom: themeAssets.spacing[6],
    gap: themeAssets.spacing[3],
  },
  card: {
    borderRadius: 20,
  },
  input: {
    marginBottom: themeAssets.spacing[2],
  },
  infoTitle: {
    marginBottom: themeAssets.spacing[2],
  },
  infoSubtitle: {
    color: themeAssets.palette.subtext,
    marginBottom: themeAssets.spacing[3],
  },
  buttonRow: {
    marginTop: themeAssets.spacing[4],
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonSpacing: {
    marginLeft: themeAssets.spacing[2],
  },
  feedbackCardError: {
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
  },
  feedbackCardSuccess: {
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
  },
  feedbackTitle: {
    marginBottom: themeAssets.spacing[1],
  },
});

