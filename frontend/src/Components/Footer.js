import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';
import Image_1 from './Images/photo_2024-10-29_21-03-55.jpg';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { i18n, t } = useTranslation();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const align = dir === 'rtl' ? 'text-end' : 'text-start';
  const contacts = t('footer.contacts', { returnObjects: true });
  const firstCol = contacts.slice(0, 4);
  const secondCol = contacts.slice(4);
  const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('i18nextLng', lng); // ✅ Persist selection
};

  return (
    <div className={`footer pt-4 pb-3 text-white-50 ${align}`} dir={dir} style={{ backgroundColor: '#1c1c1c' }}>
      <Container>
        <Row>
          {/* Left column (Image + Info) */}
          <Col lg={6} className={`d-flex flex-column flex-md-row ${dir === 'rtl' ? 'mb-md-3' : 'mb-4'}`}>
            <img
              src={Image_1}
              className={` ${dir === 'rtl' ? 'ms-md-5' : 'me-md-5'} mb-3`}
              alt="Logo"
            //   style={{ maxWidth: 100, height: 'auto' }}
            />
            <div className="info">
              <h5 className="text-light mb-2">{t('footer.phoneTitle')}</h5>
              <p className="mb-4" style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>
                {t('footer.phone')}
              </p>
              <Dropdown>
                <Dropdown.Toggle variant="success" className="bg-transparent fs-5 border-0">
                  {t('language')}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => i18n.changeLanguage('ar')}>
                    {t('arabic')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => i18n.changeLanguage('en')}>
                    {t('english')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>

          {/* Right column (Contacts) */}
          <Col lg={6} className="mt-4">
            <h5 className="text-light mb-3">{t('footer.contactTitle')}</h5>
            <div className={`contact d-flex flex-wrap gap-4 ${dir === 'rtl' ? 'justify-content-end' : ''}`}>
              <div className="mm">
                {firstCol.map((person, index) => (
                  <h6 key={index} className="mb-3">
                    {person.name}
                    <br />
                    <span style={{ direction: 'ltr', unicodeBidi: 'isolate', fontSize: '0.9rem', fontFamily: 'monospace', display: 'inline-block' }}>
                      {person.email}
                    </span>
                  </h6>
                ))}
              </div>
              <div className="nn">
                {secondCol.map((person, index) => (
                  <h6 key={index} className="mb-3">
                    {person.name}
                    <br />
                    <span style={{ direction: 'ltr', unicodeBidi: 'isolate', fontSize: '0.9rem', fontFamily: 'monospace', display: 'inline-block' }}>
                      {person.email}
                    </span>
                  </h6>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}