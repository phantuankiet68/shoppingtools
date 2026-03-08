"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F4RefreshButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F4" label="Refresh" onClick={onClick} />;
}
