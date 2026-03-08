"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F2SearchButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F2" label="Search" onClick={onClick} />;
}
