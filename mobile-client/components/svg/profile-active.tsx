import Svg, { Path, SvgProps, G } from "react-native-svg";

export default function ProfileActive(props: SvgProps) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <G fillRule="evenodd" clipRule="evenodd" {...props}>
        <Path d="M6.75 6.5a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zM4.25 18.571a5.321 5.321 0 015.321-5.321h4.858a5.321 5.321 0 015.321 5.321 4.179 4.179 0 01-4.179 4.179H8.43a4.179 4.179 0 01-4.179-4.179z" />
      </G>
    </Svg>
  );
}
