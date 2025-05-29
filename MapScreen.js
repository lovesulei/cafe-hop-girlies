import * as Location from 'expo-location';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@env';
import customMarker from './assets/custom_marker.png';
import { colors, globalStyles } from './globalStyles';
import arrowImg from './assets/arrow.png';

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

if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.infoText, { color: colors.clayRed }]}>{errorMsg}</Text>
      </View>
    );
  }
  if (!region) {
    return (
      <View style={styles.centered}>
        <Text style={globalStyles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.map}>
  <MapView
    ref={mapRef}
    provider="google"
    style={styles.map}
    region={region}
    onPress={(event) => {
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
        image={customMarker}
        onPress={(e) => {
          e.stopPropagation?.();
        }}

      >
        <Callout onPress={() => navigation.navigate('CafeDetails', { cafe })} tooltip>
          <View style={styles.calloutContainer}>
            <Text style={globalStyles.calloutTitle}>{cafe.name}</Text>
            <Text style={globalStyles.calloutAddress}>{cafe.vicinity}</Text>
            <Image source={arrowImg} style={globalStyles.calloutArrow} />
          </View>
        </Callout>
      </Marker>
    ))}
  </MapView>

  <View style={styles.zoomContainer}>
    <TouchableOpacity style={globalStyles.zoomButton} onPress={() => zoom('in')}>
      <Text style={globalStyles.zoomText}>＋</Text>
    </TouchableOpacity>
    <TouchableOpacity style={globalStyles.zoomButton} onPress={() => zoom('out')}>
      <Text style={globalStyles.zoomText}>－</Text>
    </TouchableOpacity>
  </View>

  {nextPageToken && !loadingMore && (
    <View style={styles.loadMoreButtonWrapper}>
      <TouchableOpacity style={globalStyles.loadMoreButton} onPress={loadMoreCafes}>
        <Text style={globalStyles.buttonText}>Load More Cafes</Text>
      </TouchableOpacity>
    </View>
  )}

  {loadingMore && (
    <ActivityIndicator size="small" color="#0000ff" style={styles.loadingIndicator} />
  )}
</View>

  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    justifyContent: 'space-between',
    height: 100,
  },
  calloutContainer: {
  padding: 10,
  maxWidth: 220,
  backgroundColor: colors.rosyPink,
  borderRadius: 12,
  borderWidth: 0,
  overflow: 'hidden', // forcefully clips child overflow (e.g. borders)
},
  loadingIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  loadMoreButtonWrapper: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});