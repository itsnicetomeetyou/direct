import React from "react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useGetStatisticsQuery } from "@/redux/statisticsApiSlice";
import { useGetProfileQuery } from "@/redux/profileApiSlice";
import TransactionDetailsSkeleton from "@/components/skeleton/transaction-details-skeleton";
import DocumentItemSkeleton from "@/components/skeleton/document-item-skeleton";
import StatisticsSkeleton from "@/components/skeleton/statistics-skeleton";
import { Avatar } from "@kolking/react-native-avatar";
import { getGreeting } from "@/utils";
import { router } from "expo-router";

export default function Home() {
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const StatusItem = lazy(() => import("@/components/home/status-item"));
  const TransactionItem = lazy(() => import("@/components/home/transaction-item"));
  const {
    data: dataGetStatistics,
    isLoading: isLoadingGetStatistics,
    refetch: refetchGetStatistics,
  } = useGetStatisticsQuery({});
  const { data: dataGetProfile, isLoading: isLoadingGetProfile, refetch: refetchGetProfile } = useGetProfileQuery({});

  const useMemoDataGetStatistics = useMemo(() => {
    if (dataGetStatistics) {
      return dataGetStatistics.data;
    }
    return null;
  }, [dataGetStatistics]);

  const useMemoDataGetProfile = useMemo(() => {
    if (dataGetProfile?.data.id) {
      return dataGetProfile.data;
    }
    return null;
  }, [dataGetProfile?.data]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchGetStatistics();
    refetchGetProfile();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [refetchGetProfile, refetchGetStatistics]);

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{
        backgroundColor: "#F5F6FA",
        alignItems: "center",
        paddingBottom: moderateScale(10),
        flex: 1,
      }}
      scrollEnabled={true}
      showsVerticalScrollIndicator
    >
      <View
        style={{
          width: (90 / 100) * width,
          flex: 1,
          marginTop: moderateScale(10),
          gap: moderateScale(10),
        }}
      >
        {refreshing || isLoadingGetStatistics || isLoadingGetProfile ? (
          <View
            style={{
              alignItems: "center",
              padding: moderateScale(16),
              borderRadius: moderateScale(10),
            }}
          >
            <DocumentItemSkeleton />
            <StatisticsSkeleton />
            <TransactionDetailsSkeleton />
            <TransactionDetailsSkeleton />
          </View>
        ) : (
          <Suspense
            fallback={
              <>
                <View
                  style={{
                    alignItems: "center",
                    padding: moderateScale(16),
                    borderRadius: moderateScale(10),
                  }}
                >
                  <DocumentItemSkeleton />
                  <StatisticsSkeleton />
                  <TransactionDetailsSkeleton />
                  <TransactionDetailsSkeleton />
                </View>
              </>
            }
          >
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                backgroundColor: "#fff",
                padding: moderateScale(16),
                borderRadius: moderateScale(10),
              }}
            >
              <Avatar
                size={40}
                colorize
                email={useMemoDataGetProfile?.email ?? ""}
                name={useMemoDataGetProfile?.UserInformation?.firstName ?? ""}
              />
              <View
                style={{
                  marginLeft: moderateScale(10),
                }}
              >
                <Text
                  style={{
                    fontFamily: "GGSansSemiBold",
                    fontSize: moderateScale(14),
                  }}
                >
                  {getGreeting()}
                </Text>
                <Text
                  style={{
                    fontFamily: "GGSansBold",
                    fontSize: moderateScale(16),
                    marginTop: moderateScale(-5),
                  }}
                >
                  {useMemoDataGetProfile?.UserInformation?.firstName} {useMemoDataGetProfile?.UserInformation?.lastName}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <StatusItem
                  icon={<FontAwesome name="check" size={24} color="green" />}
                  label="Completed"
                  count={useMemoDataGetStatistics?.status?.completed || 0}
                />
                <StatusItem
                  icon={<MaterialCommunityIcons name="file-cancel-outline" size={24} color="blue" />}
                  label="Processing"
                  count={useMemoDataGetStatistics?.status?.processing || 0}
                />
              </View>
              <View style={styles.row}>
                <StatusItem
                  icon={<FontAwesome name="close" size={24} color="red" />}
                  label="Cancelled"
                  count={useMemoDataGetStatistics?.status?.cancelled || 0}
                />
                <StatusItem
                  icon={<MaterialIcons name="pending-actions" size={24} color="orange" />}
                  label="Pending"
                  count={useMemoDataGetStatistics?.status?.pending || 0}
                />
              </View>
            </View>

            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: moderateScale(16),
                }}
              >
                <Text
                  style={{
                    fontFamily: "GGSansSemiBold",
                  }}
                >
                  Transaction History
                </Text>
                <TouchableOpacity onPress={() => router.push("/(dashboard-tab)/documents")}>
                  <Text
                    style={{
                      fontFamily: "GGSansSemiBold",
                    }}
                  >
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              {dataGetStatistics?.data.transaction?.length === 0 && (
                <View
                  style={{
                    padding: moderateScale(40),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "GGSansMedium",
                      opacity: 0.5,
                    }}
                  >
                    No Transaction
                  </Text>
                </View>
              )}

              {useMemoDataGetStatistics?.transaction?.map((item, index) => (
                <TransactionItem key={index} {...item} />
              ))}
            </View>
          </Suspense>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: moderateScale(16),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
});
