import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";

export default function DocumentItemSkeleton() {
  return (
    <ContentLoader width={"100%"} height={65} backgroundColor="#e1e1e1" foregroundColor="#fafafa">
      <Rect x="50" y="15" rx="5" ry="5" width="300" height="15" />
      <Rect x="50" y="39" rx="5" ry="5" width="220" height="9" />
      <Rect x="0" y="10" rx="0" ry="0" width="40" height="40" />
    </ContentLoader>
  );
}
