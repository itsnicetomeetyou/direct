'use client';
import { Poppins } from 'next/font/google';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { setOrderDataAddress } from '@/store/kiosk/orderSlice';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

const center = {
  lat: 14.6177068,
  lng: 121.1026223
};

export default function Address() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLEMAPAPIKEY ?? '';
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    version: 'beta'
  });
  const dispatch = useAppDispatch();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [additionalAddress, setAdditionalAddress] = useState<string | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(_map: google.maps.Map) {
    setMap(null);
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const pos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setPosition(pos);

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress('Address not found');
        }
      });
    }
  };

  useEffect(() => {
    if (position && address) {
      dispatch(
        setOrderDataAddress({
          googleMapAddress: address,
          longitude: position.lng,
          latitude: position.lat,
          additionalAddress: additionalAddress ?? ''
        })
      );
    }
  }, [position, address, additionalAddress, dispatch]);

  return (
    <>
      <div className="mb-12 mt-4">
        <h3 className={`text-lg font-semibold ${poppins.className}`}>Address</h3>
        <p className={`mb-4 text-sm text-black/30 ${poppins.className} font-medium`}>Please pin your address</p>
      </div>
      <div className="flex h-[50vh] items-start gap-5 space-y-2 overflow-y-auto overflow-x-hidden p-5">
        {!apiKey ? (
          <div className="flex w-1/2 items-center justify-center rounded-lg border bg-muted/30" style={{ height: 400 }}>
            <p className="text-sm text-muted-foreground">Google Maps API key not configured</p>
          </div>
        ) : isLoaded ? (
          <GoogleMap
            mapContainerStyle={{
              width: '50%',
              height: '400px'
            }}
            center={position ?? center}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
          >
            {position && (
              <Marker position={position} />
            )}
          </GoogleMap>
        ) : (
          <div className="flex w-1/2 items-center justify-center" style={{ height: 400 }}>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        )}

        <div className="flex-1">
          <div>
            <label className={`text-sm font-medium ${poppins.className} mb-2 opacity-85`}>Selected Address</label>
            <input
              type="text"
              className={`w-full rounded-lg p-3 ${poppins.className} bg-black bg-opacity-[3%] text-sm font-medium text-black/70 focus:outline-none`}
              value={address ?? ''}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className={`text-sm font-medium ${poppins.className} mb-2 opacity-85`}>
              Additional Address Details
            </label>
            <textarea
              onChange={(e) => setAdditionalAddress(e.target.value)}
              value={additionalAddress ?? ''}
              rows={6}
              className={`w-full rounded-lg p-3 ${poppins.className} bg-black bg-opacity-[3%] text-sm font-medium text-black/70 focus:outline-none`}
            ></textarea>
          </div>
        </div>
      </div>
    </>
  );
}
