import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";

export default function TransactionDetailsSkeleton() {
  return (
    <ContentLoader width={"100%"} height={100} backgroundColor="#e1e1e1" foregroundColor="#fafafa">
      <Rect x="1" y="0" rx="5" ry="5" width="93" height="10" />
      <Rect x="305" y="0" rx="5" ry="5" width="87" height="10" />
      <Rect x="1" y="25" rx="5" ry="5" width="67" height="10" />
      <Rect x="262" y="25" rx="5" ry="5" width="131" height="10" />
      <Rect x="1" y="50" rx="5" ry="5" width="119" height="10" />
      <Rect x="254" y="50" rx="5" ry="5" width="141" height="10" />
      <Rect x="1" y="75" rx="5" ry="5" width="80" height="10" />
      <Rect x="262" y="75" rx="5" ry="5" width="220" height="10" />
    </ContentLoader>
  );
}
