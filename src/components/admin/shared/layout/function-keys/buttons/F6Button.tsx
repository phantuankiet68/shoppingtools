"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F6ReportButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F6" label="Report" onClick={onClick} />;
}
