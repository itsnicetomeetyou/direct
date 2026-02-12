import { Text, ScrollView, useWindowDimensions, View, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { moderateScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import RegisterForm from "@/components/ui/auth/register-form";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { useFocusEffect } from "expo-router";
import Button from "@/components/ui/button";
import { InfoIcon } from "lucide-react-native";
import { RFValue } from "react-native-responsive-fontsize";

export default function Register() {
  const { width } = useWindowDimensions();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const onChangeContinueBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.close();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (bottomSheetModalRef.current) {
        bottomSheetModalRef.current.present();
      }

      return () => {
        bottomSheetModalRef.current?.close();
      };
    }, [])
  );

  return (
    <>
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
        <ScrollView
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <SafeAreaView
            style={{
              width: (90 / 100) * width,
              alignSelf: "center",
              justifyContent: "space-around",
              flex: 1,
            }}
          >
            <View>
              <Image
                source={require("@/assets/images/adaptive-icon.png")}
                style={{
                  width: 90,
                  height: 90,
                }}
                contentFit="contain"
              />
              <Text
                style={{
                  fontFamily: "GGSansBold",
                  fontSize: moderateScale(30),
                  color: "#fff",
                }}
              >
                Hey there 👋
              </Text>
            </View>

            <RegisterForm />

            <View></View>
            <View></View>

            <BottomSheetModal
              ref={bottomSheetModalRef}
              backdropComponent={(props) => (
                <BottomSheetBackdrop
                  pressBehavior="none"
                  {...props}
                  opacity={0.5}
                  enableTouchThrough={true}
                  appearsOnIndex={0}
                  disappearsOnIndex={-1}
                  style={[{ backgroundColor: "rgba(0, 0, 0, 1)" }, StyleSheet.absoluteFillObject]}
                />
              )}
              snapPoints={useMemo(() => ["40%"], [])}
              enablePanDownToClose={false}
              handleIndicatorStyle={{
                backgroundColor: "transparent",
              }}
            >
              <BottomSheetView
                style={{
                  width: (95 / 100) * width,
                  alignSelf: "center",
                  paddingBottom: moderateScale(20),
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <InfoIcon height={16} width={16} color={"#000000"} />
                    <Text
                      style={{
                        marginLeft: moderateScale(4),
                        fontSize: RFValue(14),
                        fontFamily: "GGSansSemiBold",
                      }}
                    >
                      Tips for a strong password
                    </Text>
                  </View>

                  <View>
                    <FlatList
                      data={[
                        { key: "Ensure your password contains at least two uppercase letters (e.g., A, B)." },
                        { key: "Include at least one special character from the following set: !, @, #, $, &, *." },
                        { key: "Make sure your password has at least two digits (e.g., 0, 1, 2)." },
                        { key: "Your password should have at least three lowercase letters (e.g., a, b, c)." },
                        { key: "The password should be exactly 8 characters long." },
                      ]}
                      renderItem={({ item }) => (
                        <View
                          style={{
                            flexDirection: "row",
                            marginVertical: moderateScale(2),
                          }}
                        >
                          <Text>•</Text>
                          <Text
                            style={{
                              fontSize: RFValue(11),
                              marginLeft: moderateScale(6),
                              fontFamily: "GGSansMedium",
                              opacity: 0.5,
                            }}
                          >
                            {item.key}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                </View>

                <Button onPress={onChangeContinueBottomSheet}>
                  <Text
                    style={{
                      fontFamily: "GGSansSemiBold",
                      fontSize: RFValue(12),
                    }}
                  >
                    Continue
                  </Text>
                </Button>
              </BottomSheetView>
            </BottomSheetModal>
          </SafeAreaView>
        </ScrollView>
      </LinearGradient>
    </>
  );
}
