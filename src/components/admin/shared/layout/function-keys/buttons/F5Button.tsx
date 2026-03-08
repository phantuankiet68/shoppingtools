"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F5CreateButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F5" label="Create" onClick={onClick} />;
}
