import { View, Text } from "react-native";
import { moderateScale } from "react-native-size-matters";
import DropdownSelect from "react-native-input-select";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { setOrderDocumentPaymentMethod } from "@/redux/documentSlice";

export default function PaymentOptions() {
  const dispatch = useAppDispatch();
  const selectOrderData = useAppSelector((state) => state.documentReducer.orderDocument);

  return (
    <View>
      <Text
        style={{
          fontFamily: "GGSansBold",
          fontSize: moderateScale(14),
          marginBottom: moderateScale(4),
        }}
      >
        Payment Options
      </Text>
      <DropdownSelect
        isSearchable
        placeholder="Select payment options..."
        options={[
          {
            label: "GCASH",
            value: "GCASH",
          },
        ]}
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
        selectedValue={selectOrderData.paymentMethod}
        onValueChange={(itemValue: any) => dispatch(setOrderDocumentPaymentMethod(itemValue))}
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
