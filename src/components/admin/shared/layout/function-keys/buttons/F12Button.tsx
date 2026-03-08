"use client";

import FunctionKeyButton from "../FunctionKeyButton";

type Props = {
  onClick?: () => void;
};

export default function F12DashboardButton({ onClick }: Props) {
  return <FunctionKeyButton hotkey="F12" label="Dashboard" onClick={onClick} />;
}
