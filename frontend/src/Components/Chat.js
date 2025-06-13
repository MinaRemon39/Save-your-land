import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';
import NavbarWithNotification from './NavbarWithNotification';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';

export default function Chat() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const landToEdit = location.state?.landToEdit;
    const [loading, setLoading] = useState(false);
    const isAddingNewLand = location.state?.isAddingNewLand || false;
    const [existingLandNames, setExistingLandNames] = useState([]);

    const [subscription, setSubscription] = useState(null);

    const [formData, setFormData] = useState({
        landName: '',
        plantType: '',
        soilType: '',
        soilPH: 0,
        soilMoisture: 0,
        soilAir: 0,
        soilTemp: 0,
        organicMatter: 0,
        ambientTemp: 0,
        humidity: 0,
        lightIntensity: 0,
        nitrogenLevel: 0,
        potassiumLevel: 0,
        phosphorusLevel: 0,
        chlorophyllContent: 0,
        electrochemicalSignal: 0,
        plant_status:''
    });

    const getStatus = (land) => {
        const stressScore = parseFloat(land.nitrogenLevel) + parseFloat(land.potassiumLevel) + parseFloat(land.phosphorusLevel);
        if (stressScore < 10) return "Healthy";
        if (stressScore < 20) return "Moderate Stress";
        return "High Stress";
    };
    const [landsUsed, setLandsUsed] = useState(0);

useEffect(() => {
  const token = localStorage.getItem('token');
  
  Promise.all([
    fetch('http://127.0.0.1:8000/api/subscription/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      }
    }).then(res => res.json()),
    
    fetch('http://localhost:8000/api/lands/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      }
    }).then(res => res.json())
  ])
  .then(([subscriptionData, landsData]) => {
    setSubscription(subscriptionData);
    setLandsUsed(landsData.length); 
  })
  .catch(error => {
  });
}, []);
    
 useEffect(() => {
  let isMounted = true;

  if (!landToEdit && !isAddingNewLand) {
      setLoading(true);
      fetch('http://localhost:8000/api/lands/', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('token')}`,
          }
      })
      .then(response => response.json())
      .then(data => {
          if (!isMounted) return; 

          if (data.length > 0) {
              navigate('/chat/lands');  
          } else {
              setLoading(false);
          }
      })
      .catch(error => {
          if (isMounted) {
              setLoading(false);
          }
      });
  } else {
      setLoading(false);
  }

  return () => {
      isMounted = false; 
  };
}, [landToEdit, isAddingNewLand, navigate]);


    useEffect(() => {
        if (landToEdit) {
            setFormData({
                landName: landToEdit.landName || '',
                plantType: landToEdit.plantType || '',
                soilType: landToEdit.soilType || '',
                soilPH: landToEdit.soilPH || 0,
                soilMoisture: landToEdit.soilMoisture || 0,
                soilAir: landToEdit.soilAir || 0,
                soilTemp: landToEdit.soilTemp || 0,
                organicMatter: landToEdit.organicMatter || 0,
                ambientTemp: landToEdit.ambientTemp || 0,
                humidity: landToEdit.humidity || 0,
                lightIntensity: landToEdit.lightIntensity || 0,
                nitrogenLevel: landToEdit.nitrogenLevel || 0,
                potassiumLevel: landToEdit.potassiumLevel || 0,
                phosphorusLevel: landToEdit.phosphorusLevel || 0,
                chlorophyllContent: landToEdit.chlorophyllContent || 0,
                electrochemicalSignal: landToEdit.electrochemicalSignal || 0,
                plant_status: landToEdit.plant_status || '',
            });
        }
    }, [landToEdit]);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleChange(name, value);
    };

    const increment = (field) => handleChange(field, parseInt(formData[field]) + 1);
    const decrement = (field) => handleChange(field, Math.max(0, parseInt(formData[field]) - 1));

const handleSave = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!subscription) {
      setErrorMessage(t('aboutSection.errorSubscription'));
      return;
    }

    if (!landToEdit && existingLandNames.includes(formData.landName)) {
        setErrorMessage(t('aboutSection.landExist'));
        return;
    }
    if (!formData.soilType) {
      setErrorMessage(t('aboutSection.soiltype'));
      return;
    }

    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('user_type');

    if (userType !== "administrator" && !landToEdit && subscription.land_profiles_allowed <= landsUsed) {
      setErrorMessage(t('aboutSection.errorLimitReached'));
      return;
    }

    if (formData.soilPH < 0 || formData.soilPH > 14) {
        setErrorMessage(t('errorPH'));
        return;
    }
    if (formData.soilMoisture < 0 || formData.soilMoisture > 100) {
        setErrorMessage(t('errors.soilMoisture'));
        return;
    }
    if (formData.soilTemp < -50 || formData.soilTemp > 80) {
        setErrorMessage(t('errors.soilTemp'));
        return;
    }
    if (formData.ambientTemp < -50 || formData.ambientTemp > 80) {
        setErrorMessage(t('errors.ambientTemp'));
        return;
    }
    if (formData.humidity < 0 || formData.humidity > 100) {
        setErrorMessage(t('errors.humidity'));
        return;
    }
    if (formData.lightIntensity < 0 || formData.lightIntensity > 200000) {
        setErrorMessage(t('errors.lightIntensity'));
        return;
    }
    if (formData.nitrogenLevel < 0 || formData.nitrogenLevel > 1000) {
        setErrorMessage(t('errors.nitrogenLevel'));
        return;
    }
    if (formData.phosphorusLevel < 0 || formData.phosphorusLevel > 500) {
        setErrorMessage(t('errors.phosphorusLevel'));
        return;
    }
    if (formData.potassiumLevel < 0 || formData.potassiumLevel > 1000) {
        setErrorMessage(t('errors.potassiumLevel'));
        return;
    }
    if (formData.organicMatter < 0 || formData.organicMatter > 20) {
        setErrorMessage(t('errors.organicMatter'));
        return;
    }

    formData.plant_status = getStatus(formData);

    const method = landToEdit ? 'PUT' : 'POST';
    const url = landToEdit
        ? `http://localhost:8000/api/lands/${landToEdit.id}/`
        : 'http://localhost:8000/api/lands/';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData)
    })
 .then(async response => {
    const errorData = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessage =
            errorData.landName?.[0] ||
            errorData.non_field_errors?.[0] ||
            errorData.error ||
            (t('errors.saveFailed'));

        throw new Error(errorMessage);
    }

    return errorData;
})
    .then(data => {
        setSuccessMessage("Land information saved successfully!");
        fetch('http://localhost:8000/api/lands/', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            }
        })
        .then(res => res.json())
        .then(lands => setLandsUsed(lands.length))
        .catch(console.error);

        navigate('/chat/lands');
    })
    .catch(error => {
            const backendMessage = error.message;

    if (backendMessage === "You already have a land with this name.") {
        setErrorMessage(t("aboutSection.landExist"));  
    } else {
        setErrorMessage(backendMessage);
    }
    });
};




    if (loading) return <Loader />;

    return (
        <div >
            <NavbarWithNotification />

            <Container className="pt-5" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                <h2 className="mb-4">{t('mainHeader')}</h2>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}

                <div className="input-field mb-3 p-3">
                    <input
                        type="text"
                        name="landName"
                        placeholder={t('landNamePlaceholder')}
                        value={formData.landName}
                        onChange={handleInputChange}
                        required
                        style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
                    />
                </div>

                <div className="input-field mb-4 p-3">
                    <input
                        type="text"
                        name="plantType"
                        placeholder={t('plantTypePlaceholder')}
                        value={formData.plantType}
                        onChange={handleInputChange}
                        required
                        style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
                    />
                </div>
                <div className="mb-4">
                    <select
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                        style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
                    >
                        <option value="">{t('soilTypePlaceholder')}</option>
                        <option value="Sandy Soil">{t('soilTypes.sandy')}</option>
                        <option value="Clay Soil">{t('soilTypes.clay')}</option>
                        <option value="Loamy Soil">{t('soilTypes.loamy')}</option>
                        <option value="Silty Soil">{t('soilTypes.silty')}</option>
                        <option value="Chalky Soil">{t('soilTypes.chalky')}</option>
                        <option value="Gravelly or Rocky Soil">{t('soilTypes.gravelly')}</option>
                    </select>
                </div>

                {[
                    { label: t("soilPH"), field: "soilPH" },
                    { label: t("soilMoisture"), field: "soilMoisture" },
                    { label: t("soilAir"), field: "soilAir" },
                    { label: t("soilTemp"), field: "soilTemp" },
                    { label: t("organicMatter"), field: "organicMatter" },
                    { label:  t("ambientTemp"), field: "ambientTemp" },
                    { label: t("humidity"), field: "humidity" },
                    { label: t("lightIntensity"), field: "lightIntensity" },
                    { label: t("nitrogenLevel"), field: "nitrogenLevel" },
                    { label: t("potassiumLevel"), field: "potassiumLevel" },
                    { label: t("phosphorusLevel"), field: "phosphorusLevel" },
                    
                      { label: t("chlorophyllContent"), field: "chlorophyllContent" },
                      { label: t("electrochemicalSignal"), field: "electrochemicalSignal" },
              
                ].map(({ label, field }) => (
                    <Row className="justify-content-end mb-3 " key={field}>
                        <Col md={6}   className={i18n.language === 'ar' ? 'text-end' : 'text-start'}><strong>{label}:</strong></Col>
                        <Col md={6}  className={i18n.language === 'ar' ? 'text-start' : 'text-end'}>
                            <Button variant="outline-danger rounded-pill" onClick={() => decrement(field)}>-</Button>
                            <input
                                type="number"
                                name={field}
                                value={formData[field]}
                                onChange={handleInputChange}
                                className="mx-2 rounded-pill"
                                style={{ width: "60px", textAlign: "center" }}
                            />
                            <Button variant="outline-success rounded-pill" onClick={() => increment(field)}>+</Button>
                        </Col>
                    </Row>
                ))}

                <button className="btn main-btn my-4" onClick={handleSave}>{t('saveButton')}</button>
            </Container>
            <Footer />
        </div>
    );
}
