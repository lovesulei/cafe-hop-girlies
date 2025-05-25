import * as Location from 'expo-location';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@env';
import customMarker from './assets/custom_marker.png';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null); // current user location
  const [selectedLocation, setSelectedLocation] = useState(null); // user-selected location on map
  const [cafes, setCafes] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const mapRef = useRef(null);

  const radius = 1500;
  const type = 'cafe';

  const fetchNearbyCafes = async (latitude, longitude, pageToken = null) => {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
      if (pageToken) {
        url += `&pagetoken=${pageToken}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        if (pageToken) {
          setCafes((prev) => [...prev, ...data.results]);
        } else {
          setCafes(data.results);
        }
        setNextPageToken(data.next_page_token || null);
        console.log(`Fetched ${data.results.length} cafes${pageToken ? ' (page token)' : ''}`);
      } else {
        setErrorMsg('Failed to fetch cafes: ' + data.status);
      }
    } catch (error) {
      setErrorMsg('Error fetching cafes: ' + error.message);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getLocationAndFetchCafes = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) setErrorMsg('Permission to access location was denied');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          const coords = loc.coords;
          setLocation(coords);
          setSelectedLocation(coords);  // Set initial selected location to current location
          setRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
          fetchNearbyCafes(coords.latitude, coords.longitude);
        }
      } catch (error) {
        if (isMounted) setErrorMsg('Failed to get location');
      }
    };

    getLocationAndFetchCafes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch cafes when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      fetchNearbyCafes(selectedLocation.latitude, selectedLocation.longitude);
      // Optionally update region to center map on new selected location
      setRegion((prev) => ({
        ...prev,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      }));
    }
  }, [selectedLocation]);

  const zoom = (type) => {
    if (!region) return;

    const factor = type === 'in' ? 0.5 : 2;
    let newLatitudeDelta = region.latitudeDelta * factor;
    let newLongitudeDelta = region.longitudeDelta * factor;

    newLatitudeDelta = Math.min(Math.max(newLatitudeDelta, 0.002), 1);
    newLongitudeDelta = Math.min(Math.max(newLongitudeDelta, 0.002), 1);

    const newRegion = {
      ...region,
      latitudeDelta: newLatitudeDelta,
      longitudeDelta: newLongitudeDelta,
    };

    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const onRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);
  };

  // Handle user tapping on map
  const onMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    // Clear pagination when new location is selected
    setNextPageToken(null);
  };

  const loadMoreCafes = async () => {
    if (!nextPageToken || !selectedLocation) return;
    setLoadingMore(true);

    // You might want retry logic here for next_page_token delays
    await fetchNearbyCafes(selectedLocation.latitude, selectedLocation.longitude, nextPageToken);
    setLoadingMore(false);
  };

  if (errorMsg) return <Text>{errorMsg}</Text>;
  if (!region) return <Text>Loading map...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider="google"
        style={styles.map}
        region={region}
        onPress={(event) => {
          // Only update selectedLocation if the tap is NOT on a marker.
          // Markers handle their own onPress.
          const { coordinate } = event.nativeEvent;
          setSelectedLocation(coordinate);
          setNextPageToken(null);
        }}
        showsUserLocation={true}
        zoomEnabled={true}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Location"
            pinColor="blue"
          />
        )}

        {cafes.map((cafe) => (
          <Marker
            key={cafe.place_id}
            coordinate={{
              latitude: cafe.geometry.location.lat,
              longitude: cafe.geometry.location.lng,
            }}
            title={cafe.name}
            description={cafe.vicinity}
            image={customMarker}  // <-- here!
            onPress={(e) => {
              // Prevent the map onPress from firing by stopping propagation.
              e.stopPropagation?.();  // works only if event supports stopPropagation
              // Or just don't do anything here, so map onPress won't trigger
              // (Marker tap won't change selectedLocation)
              // navigation.navigate('CafeDetails', { cafe })]
            }}
          >
             <Callout onPress={() => navigation.navigate('CafeDetails', { cafe })}>
              <View style={{ padding: 8, maxWidth: 220 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{cafe.name}</Text>
                <Text>{cafe.vicinity}</Text>
                <Text style={{ color: 'blue', marginTop: 5 }}>Tap here for details</Text>
              </View>
            </Callout>
            </Marker>
        ))}
      </MapView>

      <View style={styles.zoomContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => zoom('in')}>
          <Text style={styles.zoomText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => zoom('out')}>
          <Text style={styles.zoomText}>－</Text>
        </TouchableOpacity>
      </View>

      {nextPageToken && !loadingMore && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreCafes}>
          <Text style={styles.loadMoreText}>Load More Cafes</Text>
        </TouchableOpacity>
      )}
      {loadingMore && <ActivityIndicator size="small" color="#0000ff" style={styles.loadingIndicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  zoomContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    justifyContent: 'space-between',
    height: 100,
  },
  zoomButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    elevation: 4,
    marginBottom: 10,
  },
  zoomText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadMoreButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 4,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});
