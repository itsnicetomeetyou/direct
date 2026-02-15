import React, { lazy, memo, Suspense, useMemo, useState } from "react";
import { RefreshControl, ScrollView, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGetManyDocumentTransactionQuery } from "@/redux/documentApiSlice";
import DocumentItemSkeleton from "@/components/skeleton/document-item-skeleton";
import { useDebouncedCallback } from "use-debounce";

const DocumentItem = lazy(() => import("@/components/ui/document-item"));

const Documents = () => {
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: dataGetManyDocumentTransaction,
    isLoading: isLoadingGetManyDocumentTransaction,
    isError: isErrorGetManyDocumentTransaction,
    refetch: refetchGetManyDocumentTransaction,
  } = useGetManyDocumentTransactionQuery({});

  const [searchInput, setSearchInput] = useState("");

  const useMemoGetManyDocumentTransaction = useMemo(() => {
    if (Array.isArray(dataGetManyDocumentTransaction?.data) && !isErrorGetManyDocumentTransaction) {
      if (searchInput) {
        return dataGetManyDocumentTransaction.data.filter(
          (document) =>
            document.id.toLowerCase().includes(searchInput.toLowerCase()) ||
            document.status.toLowerCase().includes(searchInput.toLowerCase())
        );
      }
      return dataGetManyDocumentTransaction.data;
    }
    return [];
  }, [searchInput, isErrorGetManyDocumentTransaction, dataGetManyDocumentTransaction?.data]);

  const searchDebounced = useDebouncedCallback((value) => {
    setSearchInput(value);
  }, 500);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetchGetManyDocumentTransaction();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [refetchGetManyDocumentTransaction]);

  return (
    <View
      style={{
        backgroundColor: "#F5F6FA",
        alignItems: "center",
        flex: 1,
      }}
    >
      <View
        style={{
          width: (90 / 100) * width,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: moderateScale(10),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              height: moderateScale(48),
              paddingHorizontal: moderateScale(14),
              borderRadius: moderateScale(10),
              elevation: 1,
              flex: 1,
            }}
          >
            <AntDesign name="search" size={20} color="black" />
            <TextInput
              placeholder="Search"
              style={{
                fontFamily: "GGSansMedium",
                fontSize: moderateScale(16),
                marginLeft: moderateScale(6),
                flex: 1,
                opacity: 0.5,
              }}
              onChangeText={(text) => searchDebounced(text)}
              cursorColor={"#00000066"}
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(dashboard-screen)/request-document")}
            style={{
              backgroundColor: "#fff",
              borderRadius: moderateScale(10),
              height: moderateScale(48),
              elevation: 1,
              justifyContent: "center",
              alignItems: "center",
              width: moderateScale(80),
            }}
          >
            <AntDesign name="file-add" size={24} color="#007AEB" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingVertical: moderateScale(20),
          width: width,
          alignItems: "center",
          gap: moderateScale(10),
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {refreshing || isLoadingGetManyDocumentTransaction ? (
          <View style={{ width: (90 / 100) * width }}>
            <DocumentItemSkeleton />
            <DocumentItemSkeleton />
            <DocumentItemSkeleton />
            <DocumentItemSkeleton />
            <DocumentItemSkeleton />
            <DocumentItemSkeleton />
          </View>
        ) : (
          <Suspense
            fallback={
              <View style={{ width: (90 / 100) * width }}>
                <DocumentItemSkeleton />
                <DocumentItemSkeleton />
                <DocumentItemSkeleton />
                <DocumentItemSkeleton />
                <DocumentItemSkeleton />
                <DocumentItemSkeleton />
              </View>
            }
          >
            {useMemoGetManyDocumentTransaction.map((document, index) => (
              <DocumentItem key={index} {...document} />
            ))}
          </Suspense>
        )}
      </ScrollView>
    </View>
  );
};

export default memo(Documents);
