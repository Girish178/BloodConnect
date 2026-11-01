import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useLang } from "../context/LanguageContext";

const REGION_ID = "qr-reader-region";

export default function QrScanner({ onScan, onError }) {
  const { t } = useLang();
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const messageRef = useRef(t("verify.cameraError"));
  onScanRef.current = onScan;
  onErrorRef.current = onError;
  messageRef.current = t("verify.cameraError");

  useEffect(() => {
    let scanner = null;
    let started = false;
    let disposed = false;

    // Small delay avoids a double start under React StrictMode in development
    const timer = setTimeout(() => {
      scanner = new Html5Qrcode(REGION_ID);
      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (text) => onScanRef.current?.(text),
          () => {},
        )
        .then(() => {
          started = true;
          if (disposed) {
            scanner.stop().then(() => scanner.clear()).catch(() => {});
          }
        })
        .catch(() => onErrorRef.current?.(messageRef.current));
    }, 200);

    return () => {
      disposed = true;
      clearTimeout(timer);
      if (scanner && started) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden border-[3px] border-black bg-brand-bg">
      <div id={REGION_ID} />
    </div>
  );
}
