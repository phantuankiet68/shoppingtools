"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F11ExportButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F11" label="Export" onClick={onClick} />;
}
