


import  { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router-dom';
import NavbarWithNotification from './NavbarWithNotification';
import Loader from './Loader';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';

export default function DiseaseDetection() {
      const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
    const [image, setImage] = useState(null);
    const [detectedImage, setDetectedImage] = useState(null);
    const [error, setError] = useState('');
    const [showAdvice, setShowAdvice] = useState(false);
    const [isDetected, setIsDetected] = useState(false);
    const fileInputRef = useRef(null);
    const location = useLocation();
    const land = location.state?.land;
    const [disease, setDisease] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdviceLoading, setIsAdviceLoading] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [hasAIAssistant, setHasAIAssistant] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('user_type');

        if (userType === "administrator") {
            setIsAdmin(true);
            setHasSubscription(true);
            setHasAIAssistant(true);
            setIsCheckingSubscription(false);
            return;
        }

        if (!token) {
            setHasSubscription(false);
            setHasAIAssistant(false);
            setIsCheckingSubscription(false);
            return;
        }

        fetch('http://127.0.0.1:8000/api/subscription/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            setHasSubscription(data.disease_detection === true);
            setHasAIAssistant(data.ai_assistant === true);
        })
        .catch(err => {
            console.error('Error checking subscription:', err);
            setHasSubscription(false);
            setHasAIAssistant(false);
        })
        .finally(() => {
            setIsCheckingSubscription(false);
        });
    }, []);

    function handleImageUpload(e) {
        if (!hasSubscription && !isAdmin) return;

        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
                setDetectedImage(null);
                setShowAdvice(false);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    }

    function handleDetect() {
        if (!hasSubscription) {
            setError(t('alerts.subscriptionRequired'));
            return;
        }

        if (!image) {
            setError(t('alerts.uploadImage'));
        } else {
            setIsLoading(true);
            const formData = new FormData();
            const file = fileInputRef.current.files[0];
            formData.append('image', file);
            if (!file) {
                setError(t('alerts.reselectImage'));
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem('token');

            if (!token) {
                setError(t('alerts.noToken'));
                setIsLoading(false);
                return;
            }

            fetch('http://localhost:8000/api/disease-detection/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Token ${token}`,
                },
                credentials: 'include',
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error || t('alerts.detectFailed'));
                    });
                }
                return response.json();
                
            })
            
            .then(data => {
                if (data.output_image) {
                    const detectedImageUrl = `data:image/jpeg;base64,${data.output_image}`;
                    setDetectedImage(detectedImageUrl);
                }

                if (data.class) {
                    setDisease(data.class);
                    localStorage.setItem("detectedDisease", data.class);
                }

                setError('');
                setIsDetected(true);
            })
            .catch(error => {
                setError(t('alerts.detectFailed'));
            })
            .finally(() => {
                setIsLoading(false);
            });
            
        }
    }

    function handleAdvice() {
        if (!hasAIAssistant && !isAdmin) {
            setError(t('alerts.subscriptionRequired'));
            return;
        }

       if (!image) {
        setError(t('alerts.uploadImage'));
       } else if (!isDetected) {
        setError(t('alerts.detectFirst'));
      } else if (!disease) {
        setError(t('alerts.noDisease'));
      } else {
        const token = localStorage.getItem('token');
        if (!token) {
             setError(t('alerts.noToken'));
            return;
        }

            setIsAdviceLoading(true);
            const requestBody = {
                disease_name: disease
            };
            const user_id = localStorage.getItem("user_id");
const land_id = land?.id;

            let url = `http://localhost:8001/give-me-advice`;
            if (land_id) {
                url += `/${land_id}`;
            }

            fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
            .then(response => response.json())
            .then(data => {
                if (data.Response) {
                    setShowAdvice(data.Response);
                    setError('');
                } else {
                     console.error('No response from server:', data);
                  setError(t('alerts.adviceError'));
                }
            })
            .catch(error => {
                console.error('Error fetching advice:', error);
                setError(t('alerts.adviceFetchError'));
            })
            .finally(() => {
                setIsAdviceLoading(false);
            });
        }
    }

    function handleNewImageClick() {
        if (isCheckingSubscription) return;

        if (!hasSubscription && !isAdmin) {
            setError(t('alerts.subscriptionRequired'));
            return;
        }

        if (fileInputRef.current) {
            setError('');
            fileInputRef.current.click();
        }
    }

    const navigate = useNavigate();
    const userLands = JSON.parse(localStorage.getItem("lands")) || [];

    const handleChatClick = () => {
        if (userLands.length > 0) {
            navigate('/chat/lands');
        } else {
            navigate('/chat');
        }
    };

    const handleAddToLand = () => {
        if (!hasSubscription) {
            setError(t('alerts.subscriptionRequired'));
            return;
        }

        if (image) {
            localStorage.setItem("newDiseaseImage", image);
            localStorage.setItem("awaitingLandSelection", "true");
            navigate("/chat/lands#my_choose");
        } else {
            alert(t("alerts.uploadFirst"));
        }
    };

    if (isCheckingSubscription) {
        return (
            <div className="pt-5 pb-5">
                <Container>
                    <Loader />
                </Container>
            </div>
        );
    }

    return (
        <div>
            <NavbarWithNotification />
            <Container className="text-center mt-5" dir={isRTL ? 'rtl' : 'ltr'}>
                <Row className="justify-content-center">
                    <Col xs={12} md={6} className="mb-4 d-flex flex-column align-items-center">
                        <div className="border rounded d-flex justify-content-center align-items-center" style={{ width: '460px', height: '340px', overflow: 'hidden' }}>
                            {image ? (
                                <img src={image} alt="uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <p>{t('image.noImageToShow')}</p>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} style={{ display: 'none' }} />
                        <div className="my-3">
                            <button className={`btn btn-outline-dark ${isRTL ? 'ms-3' : 'me-2'}`}  onClick={handleNewImageClick}>{t('buttons.newImage')}</button>
                            <button className="btn btn-outline-dark" onClick={handleAddToLand}>{t('buttons.addToLand')}</button>
                        </div>
                    </Col>
                    <Col xs={12} md={6} className="d-flex flex-column align-items-center">
                        <div className="border rounded d-flex justify-content-center align-items-center" style={{ width: '460px', height: '340px', overflow: 'hidden' }}>
                            {isLoading ? (
                                <div className="dot-loader"></div>
                            ) : detectedImage ? (
                                <img src={detectedImage} alt="detected" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <p>{t('image.noImageToShow')}</p>
                            )}
                        </div>
                        <div className="my-3">
                            <button onClick={handleDetect} className={`btn main-btn ${isRTL ? 'ms-3' : 'me-2'}`}>{t('buttons.detect')}</button>
                            {isAdviceLoading ? (
                                <div className="spinner-container" role="status" aria-label="Loading">
                                    <div className="spinner-border"></div>
                                </div>
                            ) : (
                                <button className="btn btn-outline-dark" onClick={handleAdvice}>{t('buttons.giveAdvice')}</button>
                            )}
                        </div>
                    </Col>
                </Row>
                {error && (
                    <div className="alert alert-warning mt-3" role="alert">
                        {error}
                    </div>
                )}
                {showAdvice && (
                    <div className="advice-box mt-4 mb-sm-5 p-4 rounded shadow" dir="rtl">
                        <h5 className="advice-title mb-3">📌 {t('advice.title')}</h5>
                        <div className="advice-content" dangerouslySetInnerHTML={{ __html: showAdvice }} />
                    </div>
                )}
            </Container>
            <Footer />
        </div>
    );






  }



