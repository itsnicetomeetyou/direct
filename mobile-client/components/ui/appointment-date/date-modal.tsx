import { View, Modal, useWindowDimensions, TouchableWithoutFeedback } from "react-native";
import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { moderateScale } from "react-native-size-matters";
import moment from "moment";

export default function DateModal({
  openModal,
  setOpenModal,
  selectedDate,
  onClickDate,
}: {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  selectedDate: string;
  onClickDate: (date: string) => void;
}) {
  const { width } = useWindowDimensions();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});

  const disableSundaysAndRestrictedDates = (month: number, year: number) => {
    let dates: { [key: string]: any } = {};
    const start = moment().month(month).year(year).startOf("month");
    const end = moment().month(month).year(year).endOf("month");
    const restrictedDate = moment().add(3, "days").startOf("day");

    let current = start.clone();

    while (current.isBefore(end) || current.isSame(end, "day")) {
      if (current.day() === 0 || current.isBefore(restrictedDate, "days")) {
        dates[current.format("YYYY-MM-DD")] = { disabled: true, disableTouchEvent: true, textColor: "red" };
      }
      current.add(1, "day");
    }
    setMarkedDates(dates);
  };

  useEffect(() => {
    const currentMonth = moment().month();
    const currentYear = moment().year();
    disableSundaysAndRestrictedDates(currentMonth, currentYear);
  }, []);

  return (
    <Modal
      statusBarTranslucent
      visible={openModal}
      transparent
      onRequestClose={() => setOpenModal(false)}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={() => setOpenModal(false)}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <TouchableWithoutFeedback>
            <View style={{ backgroundColor: "white", borderRadius: moderateScale(8), padding: moderateScale(16) }}>
              <Calendar
                style={{
                  width: (80 / 100) * width,
                  borderRadius: moderateScale(8),
                }}
                onDayPress={(day: any) => {
                  onClickDate(day.dateString);
                }}
                onMonthChange={(month: { month: number; year: number }) => {
                  disableSundaysAndRestrictedDates(month.month - 1, month.year);
                }}
                theme={{
                  backgroundColor: "#ffffff",
                  calendarBackground: "#ffffff",
                  textSectionTitleColor: "#b6c1cd",
                  selectedDayBackgroundColor: "#00adf5",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#00adf5",
                  dayTextColor: "#2d4150",
                  textDisabledColor: "#d3d3d3",
                }}
                markedDates={{
                  ...markedDates,
                  [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: "orange" },
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
