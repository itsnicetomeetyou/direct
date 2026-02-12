import Svg, { Path, SvgProps, G } from "react-native-svg";

export default function TransactionInActive(props: SvgProps) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <G stroke="#000" strokeWidth={1.3} strokeLinejoin="round">
        <Path d="M9 12h6M9 15h6" strokeLinecap="round" />
        <Path d="M17.828 6.828c.579.578.867.868 1.02 1.235.152.368.152.776.152 1.594V17c0 1.886 0 2.828-.586 3.414C17.828 21 16.886 21 15 21H9c-1.886 0-2.828 0-3.414-.586C5 19.828 5 18.886 5 17V7c0-1.886 0-2.828.586-3.414C6.172 3 7.114 3 9 3h3.343c.818 0 1.226 0 1.594.152.368.152.657.442 1.235 1.02l2.656 2.656z" />
      </G>
    </Svg>
  );
}
