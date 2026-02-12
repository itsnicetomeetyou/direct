import { View, Modal, useWindowDimensions, Text, ToastAndroid, Platform } from "react-native";
import { moderateScale } from "react-native-size-matters";
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useState } from "react";
import Button from "../ui/button";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { setOrderDocumentGoogleMapAddress, setOrderDocumentGoogleMapPosition } from "@/redux/documentSlice";
import { formatCurrency } from "@/utils";
import { usePostDocumentCheckQuotationMutation } from "@/redux/documentApiSlice";
import { toast } from "sonner-native";

const center = {
  latitude: 14.6177068,
  longitude: 121.1026223,
};

export default function AddressModal({
  openModal,
  setOpenModal,
  onSelectedAddress,
}: {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  onSelectedAddress: (address: string) => void;
}) {
  const { width, height } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const selectOrderData = useAppSelector((state) => state.documentReducer.orderDocument);
  const [postDocumentCheckQuotation] = usePostDocumentCheckQuotationMutation();

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
      const response = await axios.get(url);
      if (response.data.status === "OK") {
        const address = response.data.results[0].formatted_address;
        return address;
      } else {
        throw new Error("Unable to fetch address");
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onClickMark = async (e: MapPressEvent) => {
    try {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const getGoogleMapAddress = await getAddressFromCoordinates(latitude, longitude);
      const getDocumentQuotation = await postDocumentCheckQuotation({
        address: getGoogleMapAddress,
        lat: `${latitude}`,
        lng: `${longitude}`,
        logisticType: selectOrderData.shippingOptions,
      }).unwrap();
      if (getDocumentQuotation?.data?.id) {
        setPosition({ latitude, longitude });
        dispatch(setOrderDocumentGoogleMapPosition({ latitude, longitude }));
        dispatch(setOrderDocumentGoogleMapAddress(getGoogleMapAddress));
        onSelectedAddress(getGoogleMapAddress);
        return setShippingFee(Number(getDocumentQuotation?.data?.priceBreakdown?.total) || 0);
      }
      if (getDocumentQuotation?.data?.message === "Given latitude/longitude is out of service area.") {
        return ToastAndroid.showWithGravityAndOffset(
          "Given location is out of service area. Please select another location",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        return toast.error("Something went wrong", {
          description: err.message || "Please try again",
        });
      }
    }
  };

  return (
    <Modal
      statusBarTranslucent
      visible={openModal}
      transparent
      onRequestClose={() => setOpenModal(false)}
      animationType="fade"
    >
      <View
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: moderateScale(16),
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: (90 / 100) * width,
            height: (80 / 100) * height,
            backgroundColor: "#FFF",
            padding: moderateScale(8),
            gap: moderateScale(6),
            borderRadius: moderateScale(8),
          }}
        >
          <MapView
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: selectOrderData.address.latitude || center.latitude,
              longitude: selectOrderData.address.longitude || center.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            style={{
              width: "100%",
              flex: 1,
            }}
            onPress={onClickMark}
          >
            {position?.latitude && position.longitude && <Marker coordinate={position} />}
          </MapView>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "GGSansMedium",
                fontSize: moderateScale(13),
              }}
            >
              Shipping Fee:
            </Text>
            <Text
              style={{
                fontFamily: "GGSansMedium",
                fontSize: moderateScale(13),
              }}
            >
              {formatCurrency(shippingFee)}
            </Text>
          </View>
          <Button
            onPress={() => {
              setOpenModal(false);
            }}
          >
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
}
