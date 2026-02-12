import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { moderateScale } from "react-native-size-matters";

export default function StatusItem({ icon, label, count }: { icon: JSX.Element; label: string; count: number }) {
  return (
    <View style={styles.item}>
      <View style={styles.iconCount}>
        {icon}
        <Text style={styles.count}>{count}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
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
  item: {
    alignItems: "center",
    flex: 1,
    padding: moderateScale(10),
  },
  count: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
    fontFamily: "GGSansBold",
    marginLeft: 2,
  },
  label: {
    fontSize: 14,
    color: "#757575",
    fontFamily: "GGSansSemiBold",
  },
});
