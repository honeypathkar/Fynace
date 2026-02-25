import 'react-native-gesture-handler';
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import firebase from '@react-native-firebase/app';
import App from './App';
import { name as appName } from './app.json';

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp();
}

AppRegistry.registerComponent(appName, () => App);
