import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useTranslation } from 'react-i18next';
import Image1 from './Images/photo_2024-12-29_04-56-43.jpg';
import Image2 from './Images/photo_2024-12-29_05-57-40.jpg';
import Image3 from './Images/photo_2024-10-29_21-03-55.jpg';
import Image4 from './Images/photo_2024-12-29_05-57-29.jpg';

export default function About() {
    const { t } = useTranslation();

  const descriptions = [
    t('aboutSection.step1'),
    t('aboutSection.step2'),
    t('aboutSection.step3'),
    t('aboutSection.step4'),
  ];
  return (
      <div className="about p-5 text-center" id="about">
        <Container>
          <h1>{t('aboutSection.title')}</h1>
          <div className="about-flow mt-5 mb-5">
            
            {[Image1, Image2, Image3, Image4].map((img, i) => (
              <div className="step-wrapper" key={i}>
                <div className="img-top mb-5 bg-transparent">
                  <img src={img} alt={`Step ${i + 1}`} />
                </div>
                <p className="fs-5 mt-5">
                  {descriptions[i]}
                </p>
              </div>
            ))}
          </div>



    <Row>
      <Col>
        <p className="fs-4 text-center mt-5">
          {t('aboutSection.finalNote')}
        </p>
      </Col>
    </Row>
  </Container>
</div>


  );
}