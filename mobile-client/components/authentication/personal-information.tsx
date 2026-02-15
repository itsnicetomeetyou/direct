import { View, Text, TextInput, ScrollView } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import {
  setPersonalInformationAddress,
  setPersonalInformationFirstName,
  setPersonalInformationLastName,
  setPersonalInformationMiddleName,
  setPersonalInformationPhoneNumber,
} from "@/redux/auth/informationRegistrationSlice";

export default function PersonalInformation() {
  const dispatch = useAppDispatch();
  const selectPersonalInformation = useAppSelector((state) => state.informationRegistrationReducer.personalInformation);
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: moderateScale(20),
        borderRadius: moderateScale(12),
        gap: moderateScale(10),
      }}
    >
      <ScrollView>
        <View
          style={{
            marginBottom: moderateScale(20),
          }}
        >
          <Text
            style={{
              fontFamily: "GGSansBold",
              fontSize: moderateScale(20),
              marginBottom: moderateScale(8),
            }}
          >
            Personal Information
          </Text>
          <Text
            style={{
              fontFamily: "GGSansMedium",
              fontSize: moderateScale(14),
              opacity: 0.4,
              lineHeight: moderateScale(18),
            }}
          >
            Please fill in your personal details below. Ensure the information is accurate and up to date.
          </Text>
        </View>

        <View
          style={{
            gap: moderateScale(20),
          }}
        >
          <View>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: "GGSansSemiBold",
                marginBottom: moderateScale(5),
              }}
            >
              First name
            </Text>
            <TextInput
              cursorColor={"#000"}
              placeholder="Enter your first name"
              style={{
                backgroundColor: "#0000000D",
                padding: moderateScale(10),
                borderRadius: moderateScale(8),
                fontSize: moderateScale(13),
                fontFamily: "GGSansMedium",
              }}
              onChangeText={(text) => dispatch(setPersonalInformationFirstName(text))}
              value={selectPersonalInformation.firstName ?? ""}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: "GGSansSemiBold",
                marginBottom: moderateScale(5),
              }}
            >
              Middle name (optional)
            </Text>
            <TextInput
              cursorColor={"#000"}
              placeholder="Enter your middle name"
              style={{
                backgroundColor: "#0000000D",
                padding: moderateScale(10),
                borderRadius: moderateScale(8),
                fontSize: moderateScale(13),
                fontFamily: "GGSansMedium",
              }}
              onChangeText={(text) => dispatch(setPersonalInformationMiddleName(text))}
              value={selectPersonalInformation.middleName ?? ""}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: "GGSansSemiBold",
                marginBottom: moderateScale(5),
              }}
            >
              Last name
            </Text>
            <TextInput
              cursorColor={"#000"}
              placeholder="Enter your last name"
              style={{
                backgroundColor: "#0000000D",
                padding: moderateScale(10),
                borderRadius: moderateScale(8),
                fontSize: moderateScale(13),
                fontFamily: "GGSansMedium",
              }}
              onChangeText={(text) => dispatch(setPersonalInformationLastName(text))}
              value={selectPersonalInformation.lastName ?? ""}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: "GGSansSemiBold",
                marginBottom: moderateScale(5),
              }}
            >
              Phone Number
            </Text>
            <TextInput
              cursorColor={"#000"}
              placeholder="Enter your phone number"
              style={{
                backgroundColor: "#0000000D",
                padding: moderateScale(10),
                borderRadius: moderateScale(8),
                fontSize: moderateScale(13),
                fontFamily: "GGSansMedium",
              }}
              onChangeText={(text) => dispatch(setPersonalInformationPhoneNumber(text))}
              value={selectPersonalInformation.phoneNo ?? ""}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: "GGSansSemiBold",
                marginBottom: moderateScale(5),
              }}
            >
              Address
            </Text>
            <TextInput
              cursorColor={"#000"}
              placeholder="Enter your address"
              multiline
              scrollEnabled
              style={{
                backgroundColor: "#0000000D",
                padding: moderateScale(10),
                borderRadius: moderateScale(8),
                fontSize: moderateScale(13),
                fontFamily: "GGSansMedium",
                height: moderateScale(100),
              }}
              onChangeText={(text) => dispatch(setPersonalInformationAddress(text))}
              value={selectPersonalInformation.address ?? ""}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
