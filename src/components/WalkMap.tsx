import { forwardRef } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { regionForPoints } from '../lib/geo';
import { useTheme } from '../lib/theme';
import type { Coord, Poop } from '../lib/types';

type Props = {
  route: Coord[];
  poops: Poop[];
  /** Follow the user's position (live walk) instead of fitting the whole route. */
  live?: boolean;
  style?: ViewStyle;
};

const WalkMap = forwardRef<MapView, Props>(function WalkMap({ route, poops, live, style }, ref) {
  const t = useTheme();
  const region = regionForPoints([...route, ...poops]);
  const start = route[0];
  const end = route[route.length - 1];

  return (
    <MapView
      ref={ref}
      style={[StyleSheet.absoluteFill, style]}
      initialRegion={region ?? undefined}
      showsUserLocation={live}
      followsUserLocation={live}
      showsMyLocationButton={live}
    >
      {route.length > 1 && (
        <Polyline
          coordinates={route}
          strokeColor={t.route}
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      )}
      {start && (
        <Marker coordinate={start} title="Start" pinColor="green" />
      )}
      {!live && end && route.length > 1 && (
        <Marker coordinate={end} title="Finish" pinColor="red" />
      )}
      {poops.map((p) => (
        <Marker
          key={p.id}
          coordinate={p}
          title="Poop"
          description={new Date(p.timestamp).toLocaleTimeString()}
          tracksViewChanges={false}
        >
          <View style={[styles.poop, { backgroundColor: t.card, borderColor: t.poop }]}>
            <Text style={styles.poopEmoji}>💩</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
});

export default WalkMap;

const styles = StyleSheet.create({
  poop: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poopEmoji: { fontSize: 18 },
});
