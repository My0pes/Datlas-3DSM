import React from "react";
import styles from "../QuemSomos.module.css";

interface CenterBoxProps {
    children: React.ReactNode;
}

export function CenterBox({ children }: CenterBoxProps) {
    return <div className={styles.box}>{children}</div>;
}