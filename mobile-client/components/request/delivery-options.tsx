import { View, Text } from "react-native";
import React, { useMemo } from "react";
import { moderateScale } from "react-native-size-matters";
import DropdownSelect from "react-native-input-select";
import { useGetDocumentDeliveryOptionsQuery } from "@/redux/documentApiSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { setOrderDocumentShippingOptions } from "@/redux/documentSlice";

export default function DeliveryOptions() {
  const dispatch = useAppDispatch();
  const selectOrderData = useAppSelector((state) => state.documentReducer.orderDocument);
  const { data: getDataDocumentDeliveryOptions } = useGetDocumentDeliveryOptionsQuery({});
  const useMemoDataDocumentDeliveryOptions = useMemo(() => {
    if (getDataDocumentDeliveryOptions) {
      return getDataDocumentDeliveryOptions.data.map((item) => ({ label: item, value: item }));
    }
    return [];
  }, [getDataDocumentDeliveryOptions]);
  return (
    <View>
      <Text
        style={{
          fontFamily: "GGSansBold",
          fontSize: moderateScale(14),
          marginBottom: moderateScale(4),
        }}
      >
        Delivery Options
      </Text>
      <DropdownSelect
        placeholder="Select delivery options..."
        isSearchable
        options={useMemoDataDocumentDeliveryOptions}
        labelStyle={{
          fontFamily: "GGSansBold",
        }}
        placeholderStyle={{
          fontFamily: "GGSansSemiBold",
          opacity: 0.4,
        }}
        multipleSelectedItemStyle={{
          fontFamily: "GGSansBold",
        }}
        dropdownStyle={{
          borderWidth: 0,
          backgroundColor: "#00000008",
          height: 0,
        }}
        selectedValue={selectOrderData.shippingOptions}
        onValueChange={(itemValue: any) => dispatch(setOrderDocumentShippingOptions(itemValue))}
        primaryColor={"#007AEB"}
        listComponentStyles={{
          sectionHeaderStyle: {
            padding: 10,
            backgroundColor: "#007AEB",
            borderRadius: moderateScale(4),
            color: "white",
            fontFamily: "GGSansBold",
          },
        }}
      />
    </View>
  );
}
