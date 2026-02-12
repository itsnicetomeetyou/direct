import React, { memo } from "react";
import { Modal, View, Text, useWindowDimensions, StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import Button from "@/components/ui/button";
import { router } from "expo-router";

const TransactionModal = (data: {
  documentRequestId: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  referenceNumber: string;
  totalAmount: string;
  xenditInvoiceId?: string;
}) => {
  const { width } = useWindowDimensions();

  const onClickPay = async () => {
    return router.push({
      pathname: "/payment-links",
      params: {
        invoiceId: data.xenditInvoiceId,
        documentRequestId: data.documentRequestId,
      },
    });
  };

  return (
    <Modal
      visible={data.visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={() => data.setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width: (90 / 100) * width }]}>
          <Text style={styles.title}>Reference Number</Text>
          <View style={styles.content}>
            <Text style={styles.referenceId}>Reference ID: {data.referenceNumber}</Text>
            <Text style={styles.description}>
              Please use the reference number and pay through our supported payment options to complete the transaction.
            </Text>
          </View>
          <View
            style={{
              gap: moderateScale(6),
            }}
          >
            <Button onPress={onClickPay}>Pay</Button>
            <Button onPress={() => data.setVisible(false)}>Close</Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  title: {
    fontFamily: "GGSansBold",
    fontSize: moderateScale(18),
    marginBottom: moderateScale(12),
    textAlign: "center",
  },
  content: {
    marginBottom: moderateScale(16),
  },
  referenceId: {
    fontFamily: "GGSansSemiBold",
    fontSize: moderateScale(16),
    marginBottom: moderateScale(8),
    textAlign: "center",
  },
  description: {
    fontFamily: "GGSansMedium",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
});

export default memo(TransactionModal);
