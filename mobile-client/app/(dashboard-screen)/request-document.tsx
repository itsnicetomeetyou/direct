import { useState } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import ScheduleAppointment from "@/components/ui/appointment-date/schedule-appointment";
import Button from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import PaymentOptions from "@/components/request/payment-options";
import DeliveryOptions from "@/components/request/delivery-options";
import DocumentSelection from "@/components/request/document-selection";
import { moderateScale } from "react-native-size-matters";
import GoogleMap from "@/components/request/google-map";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { cleanUpOrderDocument } from "@/redux/documentSlice";
import { documentApiSlice, usePostDocumentOrderMutation } from "@/redux/documentApiSlice";
import { toast } from "sonner-native";
import PhoneNumber from "@/components/request/phone-number";

export default function RequestDocument() {
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();

  const selectOrderData = useAppSelector((state) => state.documentReducer.orderDocument);
  const [postDocument] = usePostDocumentOrderMutation();
  const [loading, setLoading] = useState<boolean>(false);

  const onClickSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await postDocument({
        documentSelected: selectOrderData.orderItem,
        selectedSchedule: selectOrderData.schedule,
        deliveryOptions: selectOrderData.shippingOptions,
        paymentOptions: selectOrderData.paymentMethod,
        address: selectOrderData.address.googleMapAddress,
        additionalAddress: selectOrderData.address.additionalAddress,
        longitude: selectOrderData.address.longitude,
        latitude: selectOrderData.address.latitude,
      }).unwrap();

      if (data.id) {
        try {
          setLoading(false);
          router.back();
          toast.success("Document request submitted", {
            description: "Please wait for the approval",
          });
          return dispatch(documentApiSlice.util.resetApiState());
        } catch (err) {
          if (err instanceof Error) {
            return toast.error("Something went wrong", {
              description: err.message || "Please try again later",
            });
          }
        }
      }
      if (data?.message === "Document Not Found") {
        setLoading(false);
        return toast.error("Document Not Found", {
          description: "Please select document",
        });
      }
      if (data?.message === "Delivery Option Not Found") {
        setLoading(false);
        return toast.error("Delivery Option Not Found", {
          description: "Please select delivery option",
        });
      }
      if (data?.message === "Invalid Schedule") {
        setLoading(false);
        return toast.error("Invalid Schedule", {
          description: "Please select schedule",
        });
      }
      if (data?.message === "Invalid Payment Option") {
        setLoading(false);
        return toast.error("Invalid Payment Option", {
          description: "Please select payment option",
        });
      }
      if (data?.message === "Schedule is Required for Selected Delivery Option") {
        setLoading(false);
        return toast.error("Schedule Required", {
          description: "Schedule is Required for Selected Delivery Option",
        });
      }
      if (data?.message === "Please select a delivery option") {
        setLoading(false);
        return toast.error("Delivery Option Required", {
          description: "Please select a delivery option",
        });
      }
      if (data?.message === "Google Map pin is required for Lalamove delivery option") {
        setLoading(false);
        return toast.error("Google Map Pin Required", {
          description: "Google Map pin is required for Lalamove delivery option",
        });
      }
      if (data?.message === "Longitude and Latitude is required for Lalamove delivery option") {
        setLoading(false);
        return toast.error("Position is Required", {
          description: "Longitude and Latitude is required for Lalamove delivery option",
        });
      }
      if (data?.message === "Additional Address is required for Lalamove delivery option") {
        setLoading(false);
        return toast.error("Additional Address is Required", {
          description: "Additional Address is required for Lalamove delivery option",
        });
      }
      if (data?.message === "Schedule is already full") {
        setLoading(false);
        return toast.error("Schedule is already full", {
          description: "Please select another schedule",
        });
      }
      setLoading(false);
      return toast.error("Something went wrong", {
        description: "Please try again later",
      });
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        return toast.error("Something went wrong", {
          description: err.message || "Please try again later",
        });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(cleanUpOrderDocument());
      };
    }, [dispatch])
  );

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: "#F5F6FA",
        alignItems: "center",
      }}
      showsVerticalScrollIndicator
    >
      <View
        style={{
          width: (90 / 100) * width,
          marginBottom: moderateScale(20),
        }}
      >
        <Text
          style={{
            fontFamily: "GGSansBold",
            fontSize: moderateScale(28),
            marginVertical: moderateScale(20),
          }}
        >
          Request a document you needed!
        </Text>

        <View
          style={{
            backgroundColor: "#FFF",
            padding: moderateScale(20),
            borderRadius: moderateScale(8),
            gap: moderateScale(20),
          }}
        >
          <DocumentSelection />
          <DeliveryOptions />
          {selectOrderData.shippingOptions !== "PICKUP" && selectOrderData.shippingOptions && <GoogleMap />}
          {selectOrderData.shippingOptions === "PICKUP" && <ScheduleAppointment />}
          <PaymentOptions />
          {selectOrderData.shippingOptions !== "PICKUP" && <PhoneNumber />}
        </View>

        <View
          style={{
            marginTop: moderateScale(20),
          }}
        >
          <Button onPress={onClickSubmit} loading={loading}>
            Order
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
