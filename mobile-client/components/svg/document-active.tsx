import Svg, { Path, SvgProps, G } from "react-native-svg";

export default function DocumentActive(props: SvgProps) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <G {...props}>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 5v14a3 3 0 003 3h10a3 3 0 003-3V9a3 3 0 00-3-3H5a1 1 0 01-1-1zm3.25 7a.75.75 0 01.75-.75h8a.75.75 0 010 1.5H8a.75.75 0 01-.75-.75zm0 3.5a.75.75 0 01.75-.75h5.5a.75.75 0 010 1.5H8a.75.75 0 01-.75-.75z"
        />
        <Path d="M4.409 4.087A1 1 0 015 5h12c.345 0 .68.044 1 .126v-.82a2 2 0 00-2.283-1.98L4.92 3.87a1.068 1.068 0 00-.511.218z" />
      </G>
    </Svg>
  );
}
