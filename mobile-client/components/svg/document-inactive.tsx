import Svg, { Path, SvgProps } from "react-native-svg";

export default function DocumentInActive(props: SvgProps) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.611 1.584a2.75 2.75 0 013.139 2.722v1.377a3.75 3.75 0 012 3.317v10A3.75 3.75 0 0117 22.75H7A3.75 3.75 0 013.25 19V5v-.028-.043c0-.906.666-1.675 1.564-1.803L15.61 1.584zM4.75 6.75V19A2.25 2.25 0 007 21.25h10A2.25 2.25 0 0019.25 19V9A2.25 2.25 0 0017 6.75H4.75zm.321-1.5H17.25v-.944a1.25 1.25 0 00-1.427-1.237L5.026 4.61a.321.321 0 00.045.639zM7.25 12a.75.75 0 01.75-.75h8a.75.75 0 010 1.5H8a.75.75 0 01-.75-.75zm0 3.5a.75.75 0 01.75-.75h5.5a.75.75 0 010 1.5H8a.75.75 0 01-.75-.75z"
        fill="#000"
      />
    </Svg>
  );
}
