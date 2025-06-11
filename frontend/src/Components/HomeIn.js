import About from './About';
import Footer from './Footer';
import Articles from './Articles';
import NavbarWithNotification from './NavbarWithNotification';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

export default function HomeIn() {
      const { t } = useTranslation();
    const messageLines = t("welcomeMessage", { plant: t("plant") }).split("\n");
    const isArabic = i18n.language === 'ar';
    const dir = isArabic ? 'rtl' : 'ltr';
    const textAlign = isArabic ? 'end' : 'start'; // Bootstrap: 'start' for left, 'end' for right
  
      // Get the full translated message with a placeholder
    const rawMessage = t("welcomeMessage", { plant: "__PLANT__" });
      // Replace placeholder with span-wrapped plant translation
    const messageWithSpan = rawMessage.replace(
      "__PLANT__",
      `<span class="highlight-plant">${t("plant")}</span>`
    );
  return (
    <div>
<NavbarWithNotification />
      <div className="landing" dir={dir}>
        <div className="overlay">
            <div
            className={`content position-absolute bottom-0 p-3 text-uppercase text-${textAlign}`}
          >
            <h1
              dangerouslySetInnerHTML={{
                __html: messageWithSpan.replace(/\n/g, "<br />"),
              }}
            />
          </div>
          
        </div>
      </div>
      <Articles />
      <About />
      <Footer />
    </div>
  );
}