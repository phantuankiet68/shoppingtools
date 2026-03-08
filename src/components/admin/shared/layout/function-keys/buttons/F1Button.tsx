"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F1HelpButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F1" label="Help" onClick={onClick} />;
}
