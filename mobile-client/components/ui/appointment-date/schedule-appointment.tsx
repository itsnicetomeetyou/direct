import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { moderateScale } from "react-native-size-matters";
import DateModal from "./date-modal";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { setOrderDocumentSchedule } from "@/redux/documentSlice";

export default function ScheduleAppointment() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState("");
  const dispatch = useAppDispatch();
  const onClickDate = (date: string) => {
    setSelectedDate(date);
    setOpenModal(false);
    dispatch(setOrderDocumentSchedule(new Date(date)));
  };
  return (
    <View>
      <DateModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedDate={selectedDate}
        onClickDate={onClickDate}
      />
      <Text
        style={{
          fontFamily: "GGSansBold",
          fontSize: moderateScale(14),
          marginBottom: moderateScale(4),
        }}
      >
        Schedule Options
      </Text>

      <TouchableOpacity
        onPress={() => setOpenModal(!openModal)}
        style={{
          backgroundColor: "#00000008",
          padding: moderateScale(20),
          borderRadius: moderateScale(8),
        }}
      >
        {selectedDate ? (
          <Text
            style={{
              fontFamily: "GGSansSemiBold",
            }}
          >
            {selectedDate}
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: "GGSansSemiBold",
              opacity: 0.4,
            }}
          >
            Select schedule date...
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
