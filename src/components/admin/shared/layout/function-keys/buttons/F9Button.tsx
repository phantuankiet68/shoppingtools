"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F9SaveButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F9" label="Save" onClick={onClick} />;
}
