import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { moderateScale } from "react-native-size-matters";
import AddressModal from "./address-modal";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { setOrderDocumentAdditionalAddress } from "@/redux/documentSlice";

export default function GoogleMap() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const dispatch = useAppDispatch();
  const selectOrderDocument = useAppSelector((state) => state.documentReducer.orderDocument);
  return (
    <>
      <View>
        <AddressModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          onSelectedAddress={(e) => {
            setAddress(e);
          }}
        />
        <Text
          style={{
            fontFamily: "GGSansBold",
            fontSize: moderateScale(14),
            marginBottom: moderateScale(4),
          }}
        >
          Address
        </Text>

        <TouchableOpacity
          onPress={() => setOpenModal(!openModal)}
          style={{
            backgroundColor: "#00000008",
            padding: moderateScale(20),
            borderRadius: moderateScale(8),
          }}
        >
          {address ? (
            <Text
              style={{
                fontFamily: "GGSansSemiBold",
              }}
            >
              {address}
            </Text>
          ) : (
            <Text
              style={{
                fontFamily: "GGSansSemiBold",
                opacity: 0.4,
              }}
            >
              Select google map address...
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View>
        <Text
          style={{
            fontFamily: "GGSansBold",
            fontSize: moderateScale(14),
            marginBottom: moderateScale(4),
          }}
        >
          Additional Address
        </Text>

        <TextInput
          placeholder="Additional address"
          multiline
          numberOfLines={4}
          onChangeText={(text) => dispatch(setOrderDocumentAdditionalAddress(text))}
          value={selectOrderDocument.address.additionalAddress || ""}
          style={{
            backgroundColor: "#00000008",
            padding: moderateScale(20),
            borderRadius: moderateScale(8),
            fontFamily: "GGSansSemiBold",
          }}
          placeholderTextColor={"#00000066"}
        />
      </View>
    </>
  );
}
