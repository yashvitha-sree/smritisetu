import { useState, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import "./GovtStyles.css";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);
  const { t } = useLanguage();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true); // Show back online message briefly
      setTimeout(() => setShowBanner(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`offline-banner ${isOnline ? "online" : "offline"}`}>
      <div className="banner-content">
        {isOnline ? t("backOnline") : t("offlineMsg")}
      </div>
    </div>
  );
}
