// @ts-ignore
import { ProgressStep, ProgressSteps } from "react-native-progress-steps";
import { View, SafeAreaView, useWindowDimensions, ScrollViewProps, StyleSheet } from "react-native";
import React from "react";
import { moderateScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import PersonalInformation from "@/components/authentication/personal-information";
import AcademicInformation from "@/components/authentication/academic-information";
import VerifyInformation from "@/components/authentication/verify-information";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { usePostDashboardProfileMutation } from "@/redux/dashboardApiSlice";
import { useAppSelector } from "@/hooks/useTypedSelector";

export default function InformationRegistration() {
  const { width } = useWindowDimensions();
  const { personalInformation, academicInformation } = useAppSelector((state) => state.informationRegistrationReducer);
  const [postDashboardProfile] = usePostDashboardProfileMutation();

  const defaultScrollViewProps: ScrollViewProps = {
    keyboardShouldPersistTaps: "handled",
    contentContainerStyle: {
      flex: 1,
      justifyContent: "center",
    },
  };
  const progressStepsStyle = {
    activeStepIconBorderColor: "#007AEB",
    activeLabelColor: "white",
    activeStepNumColor: "#007AEB",
    activeStepIconColor: "white",
    completedStepIconColor: "#007AEB",
    completedProgressBarColor: "#007AEB",
    completedCheckColor: "white",
    labelFontFamily: "GGSansMedium",
    labelFontSize: moderateScale(12),
    activeLabelFontSize: moderateScale(14),
  };

  const onSubmitSteps = async () => {
    try {
      const informationData = {
        firstName: personalInformation.firstName,
        middleName: personalInformation.middleName,
        lastName: personalInformation.lastName,
        studentNo: academicInformation.studentNo,
        specialOrder: academicInformation.specialOrderNo,
        lrn: academicInformation.lrn,
        phoneNo: personalInformation.phoneNo,
        address: personalInformation.address,
      };
      const { data, status } = await postDashboardProfile(informationData).unwrap();
      if (status === 201 && data.id) {
        toast.success("Information successfully submitted.", {
          description: "You are now redirecting to dashboard...",
        });
        return router.push("/(dashboard-tab)/home");
      }
      if (status === 401 && data.message === "Unauthorized") {
        return toast.error("Unauthorized access. Please login again.", {
          description: "You are now redirecting to login...",
        });
      }
      return toast.error("An error occurred. Please try again later.", {
        description: "Error: " + data.message,
      });
    } catch (err: any) {
      const message =
        err instanceof Error
          ? err.message
          : err?.data?.message || err?.error || "Something went wrong. Please try again.";
      return toast.error("An error occurred. Please try again later.", {
        description: typeof message === "string" ? "Error: " + message : "Please try again later.",
      });
    }
  };

  return (
    <LinearGradient
      colors={["#E900C4", "#007AEB"]}
      style={{
        flex: 1,
      }}
      start={{
        x: 1.8,
        y: 0,
      }}
    >
      <SafeAreaView
        style={{
          width: (90 / 100) * width,
          alignSelf: "center",
          justifyContent: "center",
          flex: 1,
          marginTop: moderateScale(20),
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <ProgressSteps {...progressStepsStyle}>
            <ProgressStep
              label="Personal Information"
              scrollViewProps={defaultScrollViewProps}
              setActiveStep={() => {}}
              activeStep={0}
              stepCount={0}
              nextBtnTextStyle={style.nextBtnTextStyle}
              children={<PersonalInformation />}
            />

            <ProgressStep
              label="Academic Information"
              scrollViewProps={defaultScrollViewProps}
              setActiveStep={() => {}}
              activeStep={1}
              stepCount={1}
              previousBtnTextStyle={style.previousBtnTextStyle}
              nextBtnTextStyle={style.nextBtnTextStyle}
              children={<AcademicInformation />}
            />

            <ProgressStep
              label="Verify"
              onSubmit={onSubmitSteps}
              scrollViewProps={defaultScrollViewProps}
              setActiveStep={() => {}}
              activeStep={2}
              stepCount={2}
              previousBtnTextStyle={style.previousBtnTextStyle}
              nextBtnTextStyle={style.nextBtnTextStyle}
              children={<VerifyInformation />}
            />
          </ProgressSteps>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const style = StyleSheet.create({
  nextBtnTextStyle: {
    fontFamily: "GGSansSemiBold",
    color: "#fff",
    fontSize: moderateScale(12),
  },
  previousBtnTextStyle: {
    fontFamily: "GGSansSemiBold",
    color: "#fff",
    fontSize: moderateScale(12),
  },
});
