"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F3DeleteButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F3" label="Delete" onClick={onClick} />;
}
