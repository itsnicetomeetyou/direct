import { View, Text, Pressable } from "react-native";
import { useMemo } from "react";
import { moderateScale } from "react-native-size-matters";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { useGetDocumentListQuery } from "@/redux/documentApiSlice";
import DropdownSelect from "react-native-input-select";
import { setOrderDocumentItem } from "@/redux/documentSlice";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function DocumentSelection() {
  const dispatch = useAppDispatch();
  const selectOrderData = useAppSelector((state) => state.documentReducer.orderDocument);
  const { data: getDataDocumentList } = useGetDocumentListQuery({});

  const useMemoDataDocumentList = useMemo(() => {
    if (getDataDocumentList) {
      return getDataDocumentList.data.map((item) => ({
        label: (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: "GGSansRegular",
                fontSize: moderateScale(12),
                color: "#000",
              }}
            >
              {item.name}
            </Text>
            <Pressable
              style={{
                marginLeft: moderateScale(8),
              }}
              onPress={() =>
                item.sampleDocs
                  ? router.push({
                      pathname: "/(dashboard-screen)/pdf-viewer",
                      params: {
                        uri: item.sampleDocs,
                        name: item.name,
                      },
                    })
                  : null
              }
              children={<Ionicons name="open-outline" size={moderateScale(16)} color="#00abc5" />}
            />
          </View>
        ),
        value: item.id,
      }));
    }
    return [];
  }, [getDataDocumentList]);

  return (
    <View>
      <Text
        style={{
          fontFamily: "GGSansBold",
          fontSize: moderateScale(14),
          marginBottom: moderateScale(4),
        }}
      >
        Document
      </Text>
      <DropdownSelect
        placeholder="Select documents..."
        options={useMemoDataDocumentList}
        primaryColor={"#87dfe9"}
        dropdownStyle={{
          borderWidth: 0,
        }}
        selectedValue={selectOrderData.orderItem}
        onValueChange={(itemValue: any) => {
          dispatch(setOrderDocumentItem(itemValue));
        }}
        isMultiple
        isSearchable
        labelStyle={{
          backgroundColor: "red",
        }}
      />
    </View>
  );
}
