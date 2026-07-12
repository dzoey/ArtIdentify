import React, {useState, useRef} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {CameraScreen} from './src/screens/CameraScreen';
import {ResultsScreen} from './src/screens/ResultsScreen';
import {DetailScreen} from './src/screens/DetailScreen';
import {CollectionScreen} from './src/screens/CollectionScreen';

import type {DetectedObject, LocationData, ObjectInfo, ScanRecord} from './src/types';
import {saveScan} from './src/services/StorageService';

// ─── Navigation Types ───────────────────────────────────────────
type RootStackParamList = {
  CameraTab: undefined;
  CollectionTab: undefined;
  Results: {
    photoUri: string;
    objects: DetectedObject[];
    location: LocationData | null;
  };
  Detail: {
    info: ObjectInfo;
    photoUri?: string;
  };
};

type TabParamList = {
  CameraTab: undefined;
  CollectionTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0A0A1A',
    card: '#1C1C2E',
    text: '#FFFFFF',
    primary: '#00E5FF',
    border: '#333355',
  },
};

// ─── Tab Icons (simple text-based to avoid native icon font issues) ───
function CameraTabIcon({color}: {color: string}) {
  return (
    <React.Fragment>
      {/* Placeholder — vector icons are set up but we keep it simple */}
    </React.Fragment>
  );
}

// ─── Tab Navigator ────────────────────────────────────────────────
function TabNavigator({onPhotoCaptured}: {onPhotoCaptured: (uri: string, objects: DetectedObject[], loc: LocationData | null) => void}) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00E5FF',
        tabBarInactiveTintColor: '#666688',
        tabBarStyle: {
          backgroundColor: '#1C1C2E',
          borderTopColor: '#333355',
          paddingBottom: 4,
          height: 56,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="CameraTab"
        options={{tabBarLabel: 'Camera', tabBarIconStyle: {display: 'none'}}}>
        {() => <CameraScreen onPhotoCaptured={onPhotoCaptured} />}
      </Tab.Screen>
      <Tab.Screen
        name="CollectionTab"
        options={{tabBarLabel: 'Collection', tabBarIconStyle: {display: 'none'}}}>
        {({navigation}) => (
          <CollectionScreen
            onSelectScan={(scan: ScanRecord) => {
              // Navigate to results from a saved scan
              navigation.getParent()?.navigate('Results', {
                photoUri: scan.photoUri,
                objects: scan.detectedObjects,
                location: scan.location || null,
              });
            }}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
function App(): React.JSX.Element {
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [currentObjects, setCurrentObjects] = useState<DetectedObject[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  function handlePhotoCaptured(
    photoUri: string,
    objects: DetectedObject[],
    location: LocationData | null,
  ) {
    setCurrentPhoto(photoUri);
    setCurrentObjects(objects);
    setCurrentLocation(location);
  }

  async function handleSaveScan(photoUri: string, objects: DetectedObject[], location: LocationData | null) {
    const scan: ScanRecord = {
      id: `scan_${Date.now()}`,
      timestamp: Date.now(),
      photoUri,
      location: location || undefined,
      detectedObjects: objects,
    };
    await saveScan(scan);
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A1A" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName="CameraTab"
          screenOptions={{
            headerStyle: {backgroundColor: '#1C1C2E'},
            headerTintColor: '#00E5FF',
            headerTitleStyle: {fontWeight: '700'},
            contentStyle: {backgroundColor: '#0A0A1A'},
          }}>
          <Stack.Screen
            name="CameraTab"
            options={{headerShown: false}}>
            {({navigation}) => (
              <TabNavigator
                onPhotoCaptured={(uri, objects, loc) => {
                  handlePhotoCaptured(uri, objects, loc);
                  navigation.navigate('Results', {photoUri: uri, objects, location: loc});
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="Results"
            options={{title: 'Detection Results'}}>
            {({route, navigation}) => {
              const {photoUri, objects, location} = route.params;
              return (
                <ResultsScreen
                  photoUri={photoUri}
                  objects={objects}
                  location={location}
                  onObjectSelected={(info: ObjectInfo) => {
                    navigation.navigate('Detail', {info, photoUri});
                  }}
                  onRetake={() => navigation.navigate('CameraTab')}
                  onSaveScan={async () => {
                    await handleSaveScan(photoUri, objects, location);
                    navigation.navigate('CameraTab');
                    // Switch to collection tab
                    // (the tab navigator will show collection if user taps it)
                  }}
                />
              );
            }}
          </Stack.Screen>

          <Stack.Screen
            name="Detail"
            options={{title: 'Object Information'}}>
            {({route, navigation}) => (
              <DetailScreen
                info={route.params.info}
                photoUri={route.params.photoUri}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;