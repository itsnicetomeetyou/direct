import { View, Text, StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { notApplicable } from "@/utils/index";

export default function VerifyInformation() {
  const { academicInformation, personalInformation } = useAppSelector((state) => state.informationRegistrationReducer);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: moderateScale(20),
        borderRadius: moderateScale(12),
        gap: moderateScale(20),
      }}
    >
      <View style={style.informationItemViewStyle}>
        <Text style={style.labelTextStyle}>First name</Text>
        <Text style={style.inputTextStyle}>{notApplicable(personalInformation.firstName)}</Text>
      </View>

      <View style={style.informationItemViewStyle}>
        <Text style={style.labelTextStyle}>Middle name</Text>
        <Text style={style.inputTextStyle}>{notApplicable(personalInformation.middleName)}</Text>
      </View>

      <View style={style.informationItemViewStyle}>
        <Text style={style.labelTextStyle}>Last name</Text>
        <Text style={style.inputTextStyle}>{notApplicable(personalInformation.lastName)}</Text>
      </View>

      <View style={style.informationItemViewStyle}>
        <Text style={style.labelTextStyle}>Address</Text>
        <Text style={style.inputTextStyle}>{notApplicable(personalInformation.address)}</Text>
      </View>

      <View style={style.informationItemViewStyle}>
        <Text style={style.labelTextStyle}>Student No</Text>
        <Text style={style.inputTextStyle}>{notApplicable(academicInformation.studentNo)}</Text>
      </View>

      <View style={style.informationItemViewStyle}>
        <Text style={style.labelTextStyle}>Special Order No</Text>
        <Text style={style.inputTextStyle}>{notApplicable(academicInformation.specialOrderNo)}</Text>
      </View>

      <View style={style.informationItemViewStyle}>
        <Text style={style.labelTextStyle}>LRN</Text>
        <Text style={style.inputTextStyle}>{notApplicable(academicInformation.lrn)}</Text>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  informationItemViewStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelTextStyle: {
    fontFamily: "GGSansBold",
    fontSize: moderateScale(14),
  },
  inputTextStyle: {
    fontFamily: "GGSansSemiBold",
    fontSize: moderateScale(13),
    opacity: 0.6,
  },
});
