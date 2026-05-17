"use client";

import Barcode from "react-barcode";

import styles from "./barcode.module.css";

type Props = {
  value: string;
};

export default function ProductBarcode({ value }: Props) {
  if (!value) return null;

  return (
    <div className={styles.barcodeCard}>
      <Barcode
        value={value}
        format="CODE128"
        width={1.6}
        height={30}
        fontSize={12}
        margin={0}
        textMargin={6}
        background="transparent"
        lineColor="#0f172a"
        displayValue
      />
    </div>
  );
}
