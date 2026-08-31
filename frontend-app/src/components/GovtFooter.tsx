import { useLanguage } from "../i18n/LanguageContext";
import "./GovtStyles.css";

export function GovtFooter() {
  const { t } = useLanguage();

  return (
    <footer className="govt-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{t("appName")}</h3>
          <p>{t("govtScheme")}</p>
          <p>{t("govtMinistry")}</p>
        </div>
        <div className="footer-section">
          <h4>Important Links</h4>
          <ul>
            <li><a href="#">National Health Portal</a></li>
            <li><a href="#">Ministry of Health & Family Welfare</a></li>
            <li><a href="#">Digital India</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact & Support</h4>
          <p>Toll-Free Helpline: 14499</p>
          <p>Email: support@cognicare.gov.in</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t("disclaimer")}</p>
        <p>© 2024 Government of India. Prototype for Smart India Hackathon.</p>
      </div>
    </footer>
  );
}
