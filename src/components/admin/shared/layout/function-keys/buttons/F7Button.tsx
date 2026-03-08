"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F7DownloadButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F7" label="Download" onClick={onClick} />;
}
