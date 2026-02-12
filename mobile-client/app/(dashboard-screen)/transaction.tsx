import { View, Text, useWindowDimensions, ScrollView, RefreshControl } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import TransactionItem from "@/components/ui/transaction-item";
import TransactionInformation from "@/components/ui/transaction-information";
import { Image } from "expo-image";
import Button from "@/components/ui/button";
import {
  useGetManyDocumentTransactionQuery,
  useGetOneDocumentTransactionQuery,
  useGetOneLogisticTrackingQuery,
  usePostCancelOrderMutation,
  usePostDocumentCheckQuotationMutation,
} from "@/redux/documentApiSlice";
import { useCallback, useMemo, useState } from "react";
import moment from "moment";
import { formatCurrency } from "@/utils";
import TransactionModal from "@/components/ui/transaction-modal";
import { DeliveryOptions } from "@/typings";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import {
  cleanUpCreateOrder,
  setCreateOrderQuotationId,
  setCreateOrderRecipientName,
  setCreateOrderRecipientPhoneNumber,
  setCreateOrderRecipientRemarks,
  setCreateOrderRecipientStopId,
  setCreateOrderSenderStopId,
} from "@/redux/documentSlice";
import DocumentItemSkeleton from "@/components/skeleton/document-item-skeleton";
import TransactionDetailsSkeleton from "@/components/skeleton/transaction-details-skeleton";
import { IOrder } from "@lalamove/lalamove-js/dist/response/order";
import { useGetStatisticsQuery } from "@/redux/statisticsApiSlice";

export default function Transaction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: dataGetOneDocumentTransaction,
    refetch: refetchGetOneDocumentTransaction,
    isLoading: isLoadingGetOneDocumentTransaction,
  } = useGetOneDocumentTransactionQuery(id);
  const { refetch: refetchGetManyDocumentTransaction } = useGetManyDocumentTransactionQuery({});
  const skipLogisticTracking = !dataGetOneDocumentTransaction?.data?.logisticOrderId;
  const {
    data: dataGetOneLogisticTracking,
    refetch: refetchOneLogisticTracking,
    isLoading: isLoadingOneLogisticTracking,
  } = useGetOneLogisticTrackingQuery(
    {
      orderId: dataGetOneDocumentTransaction?.data.logisticOrderId ?? "",
      logisticType: dataGetOneDocumentTransaction?.data.deliverOptions ?? "LALAMOVE",
    },
    {
      skip: skipLogisticTracking,
    }
  );
  const [postDocumentCheckQuotation] = usePostDocumentCheckQuotationMutation();
  const [postCancelOrder] = usePostCancelOrderMutation();
  const { refetch: refetchGetStatistics } = useGetStatisticsQuery({});
  const { width, height } = useWindowDimensions();
  const [openModal, setOpenModal] = useState(false);
  const [shippingFee, setShippingFee] = useState<number>(0);

  const useMemoDataGetOneDocumentTransaction = useMemo(() => {
    if (dataGetOneDocumentTransaction?.data.id) {
      setShippingFee(Number(dataGetOneDocumentTransaction.data.documentPayment?.shippingFees || 0));
      return dataGetOneDocumentTransaction.data;
    }
    return {
      id: "",
      selectedSchedule: "",
      deliveryOptionsId: "",
      documentPaymentId: "",
      status: "",
      address: "",
      additionalAddress: "",
      longitude: "",
      latitude: "",
      usersId: "",
      logisticOrderId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      deliverOptions: {
        id: "",
        name: "",
        isAvailable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      documentPayment: {
        id: "",
        paymentOptions: "",
        amount: "",
        status: "",
        referenceNumber: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        xenditInvoiceId: "",
      },
      DocumentSelected: [],
    };
  }, [dataGetOneDocumentTransaction]);

  const useMemoGetOneLogisticTracking: IOrder | null = useMemo(() => {
    if (dataGetOneLogisticTracking) {
      return dataGetOneLogisticTracking.data as IOrder;
    }
    return null;
  }, [dataGetOneLogisticTracking]);

  const totalAmount = useMemo(() => {
    return useMemoDataGetOneDocumentTransaction?.DocumentSelected?.reduce(
      (sum, document) => (Number(sum) || 0) + (Number(document.document.price) || 0),
      0
    );
  }, [useMemoDataGetOneDocumentTransaction?.DocumentSelected]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetchGetOneDocumentTransaction();
    if (dataGetOneDocumentTransaction?.data?.deliverOptions === "LALAMOVE") {
      refetchOneLogisticTracking();
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [
    dataGetOneDocumentTransaction?.data?.deliverOptions,
    refetchGetOneDocumentTransaction,
    refetchOneLogisticTracking,
  ]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (useMemoDataGetOneDocumentTransaction.status === "PENDING") {
          const response = await postDocumentCheckQuotation({
            lng: useMemoDataGetOneDocumentTransaction.longitude,
            logisticType: useMemoDataGetOneDocumentTransaction.deliverOptions as DeliveryOptions,
            lat: useMemoDataGetOneDocumentTransaction.latitude,
            address: useMemoDataGetOneDocumentTransaction.additionalAddress,
          }).unwrap();
          if (response.data.id) {
            dispatch(setCreateOrderSenderStopId(response.data.stops[0].id || ""));
            dispatch(setCreateOrderQuotationId(response.data.id));
            dispatch(setCreateOrderRecipientName("Kurt Russelle Marmol"));
            dispatch(setCreateOrderRecipientPhoneNumber("+639565993908"));
            dispatch(setCreateOrderRecipientRemarks("Please deliver to the guard house"));
            dispatch(setCreateOrderRecipientStopId(response.data.stops[1].id || ""));
            setShippingFee(Number(response?.data?.priceBreakdown?.total) || 0);
          }
        }
      })();

      return () => {
        dispatch(cleanUpCreateOrder());
      };
    }, [
      dispatch,
      postDocumentCheckQuotation,
      useMemoDataGetOneDocumentTransaction.additionalAddress,
      useMemoDataGetOneDocumentTransaction.deliverOptions,
      useMemoDataGetOneDocumentTransaction.latitude,
      useMemoDataGetOneDocumentTransaction.longitude,
      useMemoDataGetOneDocumentTransaction.status,
    ])
  );

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
      <TransactionModal
        documentRequestId={id}
        visible={openModal}
        setVisible={setOpenModal}
        referenceNumber={useMemoDataGetOneDocumentTransaction?.documentPayment?.referenceNumber || ""}
        totalAmount={`${(totalAmount || 0) + shippingFee}`}
        xenditInvoiceId={useMemoDataGetOneDocumentTransaction.documentPayment?.xenditInvoiceId}
      />

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {isLoadingGetOneDocumentTransaction || refreshing || isLoadingOneLogisticTracking ? (
          <View
            style={{
              width: (90 / 100) * width,
              alignSelf: "center",
              marginTop: (8 / 100) * height,
              backgroundColor: "#fff",
              padding: moderateScale(12),
              borderRadius: moderateScale(8),
            }}
          >
            <DocumentItemSkeleton />
            <DocumentItemSkeleton />
            <DocumentItemSkeleton />
            <View
              style={{
                marginVertical: moderateScale(20),
              }}
            />
            <TransactionDetailsSkeleton />
            <TransactionDetailsSkeleton />
          </View>
        ) : (
          <View
            style={{
              width: (90 / 100) * width,
              alignSelf: "center",
              marginTop: (8 / 100) * height,
              backgroundColor: "#fff",
              padding: moderateScale(12),
              borderRadius: moderateScale(8),
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "GGSansBold",
                  fontSize: moderateScale(18),
                }}
              >
                Document Requested
              </Text>

              <View
                style={{
                  gap: 10,
                  marginTop: moderateScale(20),
                }}
              >
                {useMemoDataGetOneDocumentTransaction?.DocumentSelected?.map((item, index) => (
                  <TransactionItem key={index} {...item} />
                ))}
              </View>
            </View>

            {useMemoDataGetOneDocumentTransaction?.deliverOptions !== "PICKUP" &&
              (useMemoDataGetOneDocumentTransaction?.status === "OUTFORDELIVERY" ||
                useMemoDataGetOneDocumentTransaction?.status === "COMPLETED") && (
                <View
                  style={{
                    gap: 10,
                    marginTop: moderateScale(20),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "GGSansBold",
                      fontSize: moderateScale(18),
                    }}
                  >
                    Logistic Tracking Details
                  </Text>

                  <View>
                    <TransactionInformation
                      name="Open Logistic Map"
                      value={useMemoGetOneLogisticTracking?.shareLink ?? ""}
                      variant="link"
                    />
                    <TransactionInformation name="Status" value={useMemoGetOneLogisticTracking?.status ?? ""} />
                    <TransactionInformation
                      name="Distance"
                      value={
                        (useMemoGetOneLogisticTracking?.distance?.value ?? "") +
                        (useMemoGetOneLogisticTracking?.distance?.unit ?? "")
                      }
                    />
                    <TransactionInformation
                      name="Shipping Fees"
                      value={formatCurrency(Number(useMemoGetOneLogisticTracking?.priceBreakdown?.total)) ?? ""}
                    />
                  </View>
                </View>
              )}

            <View
              style={{
                gap: 10,
                marginTop: moderateScale(20),
              }}
            >
              <Text
                style={{
                  fontFamily: "GGSansBold",
                  fontSize: moderateScale(18),
                }}
              >
                Transaction Details
              </Text>

              <View>
                <TransactionInformation name="Status" value={useMemoDataGetOneDocumentTransaction?.status} />
                <TransactionInformation
                  name="Date Requested"
                  value={moment(useMemoDataGetOneDocumentTransaction.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
                />
                <TransactionInformation name="ID" value={useMemoDataGetOneDocumentTransaction?.id} />
                <TransactionInformation
                  name="Payment Options"
                  value={useMemoDataGetOneDocumentTransaction?.documentPayment?.paymentOptions || ""}
                />
                <TransactionInformation
                  name="Delivery Options"
                  value={useMemoDataGetOneDocumentTransaction?.deliverOptions?.toString()}
                />
                <TransactionInformation name="Document Fees" value={formatCurrency(totalAmount || 0)} />
                {useMemoDataGetOneDocumentTransaction?.deliverOptions.toString() !== "PICKUP" && (
                  <TransactionInformation name="Shipping Fees" value={formatCurrency(shippingFee)} />
                )}
                <TransactionInformation name="Total Amount" value={formatCurrency((totalAmount || 0) + shippingFee)} />
              </View>
            </View>

            <View
              style={{
                alignItems: "center",
                marginTop: moderateScale(80),
              }}
            >
              <Image
                source={require("@/assets/images/adaptive-icon.png")}
                style={{
                  height: 60,
                  width: 60,
                }}
                contentFit="contain"
              />
              <Text
                style={{
                  fontFamily: "GGSansBold",
                  fontSize: moderateScale(11),
                }}
              >
                DiReCT: Digital Record and Credential Transaction
              </Text>
              <Text
                style={{
                  fontFamily: "GGSansSemiBold",
                  opacity: 0.4,
                  fontSize: moderateScale(10),
                }}
              >
                Designed and Developed by Kurt Russelle Marmol
              </Text>
            </View>
          </View>
        )}

        {!isLoadingGetOneDocumentTransaction && !refreshing && !isLoadingOneLogisticTracking && (
          <View
            style={{
              width: (90 / 100) * width,
              alignSelf: "center",
              gap: moderateScale(6),
              marginVertical: moderateScale(20),
            }}
          >
            {useMemoDataGetOneDocumentTransaction.status === "PENDING" && (
              <>
                <Button
                  onPress={() => {
                    setOpenModal(true);
                    refetchGetStatistics();
                  }}
                >
                  Pay Now
                </Button>
                <Button
                  style={{
                    backgroundColor: "#800000",
                  }}
                  onPress={async () => {
                    await postCancelOrder(useMemoDataGetOneDocumentTransaction.id);
                    refetchGetStatistics();
                    refetchGetManyDocumentTransaction();
                    router.back();
                  }}
                >
                  Cancel Order
                </Button>
              </>
            )}
            <Button onPress={() => router.push("/(dashboard-tab)/documents")}>Back</Button>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
