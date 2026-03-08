"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F10UpdateButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F10" label="Update" onClick={onClick} />;
}
