import ContentLoader, { Rect } from "react-content-loader/native";

export default function StatisticsSkeleton() {
  return (
    <ContentLoader
      width={"100%"}
      height={300}
      backgroundColor="#e1e1e1"
      foregroundColor="#fafafa"
      style={{
        alignItems: "center",
        borderWidth: 1,
        alignSelf: "center",
      }}
    >
      <Rect x="0" y="22" rx="2" ry="2" width={"48%"} height="121" />
      <Rect x={"50%"} y="22" rx="2" ry="2" width={"48%"} height="121" />
      <Rect x="0" y="160" rx="2" ry="2" width={"48%"} height="121" />
      <Rect x={"50%"} y="160" rx="2" ry="2" width={"48%"} height="121" />
    </ContentLoader>
  );
}
