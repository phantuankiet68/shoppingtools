"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F8ImportButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F8" label="Import" onClick={onClick} />;
}
