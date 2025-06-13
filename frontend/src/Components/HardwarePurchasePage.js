import {
  Container,
  Row,
  Col,
  Button,
  Form,
} from "react-bootstrap";
import Image_1 from "./Images/d.png";
import { useNavigate } from "react-router-dom";
import Footer from './Footer';
import NavbarWithNotification from './NavbarWithNotification';
import { loadStripe } from "@stripe/stripe-js";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import React, { useState, useEffect, useMemo } from "react";
import Loader from './Loader';
import { useTranslation } from 'react-i18next';

export default function HardwarePurchasePage() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [quantity, setQuantity] = useState(0);
  const pricePerUnit = 1020;
  const totalPrice = pricePerUnit * quantity;
  const stripe = useStripe();
  const elements = useElements();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [formData, setFormData] = useState({ landProfiles: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const userLands = JSON.parse(localStorage.getItem("lands")) || [];

  const [extraFeatures, setExtraFeatures] = useState([
    { nameKey: 'diseaseDetection', price: 90, checked: false, disabled: false },
    { nameKey: 'aiAssistant', price: 150, checked: false, disabled: false },
    { nameKey: 'streaming', price: 60, checked: false, disabled: false },
  ]);
  const [currentSubscription, setCurrentSubscription] = useState({
    landProfiles: 0,
    aiAssistant: false,
    diseaseDetection: false,
    hardwareStreaming: false,
  });

  useEffect(() => {
    const fetchUnreadHardwareCount = async () => {
      const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType'); 

      if (!token || userType !== 'administrator') return;

try {
  const response = await fetch("http://localhost:8000/api/unread-hardware-count/", {
    headers: { 'Authorization': `Token ${token}` },
  });
  if (response.ok) {
    const data = await response.json();
    setUnreadCount(data.unread_count);
  } else if (response.status !== 403) {
    console.error('Failed to fetch unread hardware count:', await response.text());
  }
} catch (error) {
        console.error('Failed to fetch unread hardware count:', error);
      }
    };
    fetchUnreadHardwareCount();
  }, []);

  const fetchSubscription = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const res = await fetch("http://127.0.0.1:8000/api/subscription/", {
        headers: { 'Authorization': `Token ${token}` },
        
      });
      if (res.ok) {
        const data = await res.json();
setCurrentSubscription({
  landProfiles: Math.max(0, data.land_profiles_allowed - 1),
  aiAssistant: data.ai_assistant,
  aiAssistantExpiresAt: data.ai_assistant_expires_at,
  diseaseDetection: data.disease_detection,
  diseaseDetectionExpiresAt: data.disease_detection_expires_at,
  hardwareStreaming: data.hardware_streaming,
  hardwareStreamingExpiresAt: data.hardware_streaming_expires_at,
});


        const includedFree = 1;
        const additionalProfiles = Math.max(data.land_profiles_allowed - includedFree, 0);
        setFormData({ landProfiles: additionalProfiles });

        setExtraFeatures(prev =>
          prev.map((feature) => {
            if (feature.nameKey === 'aiAssistant') {
              return {
                ...feature,
                checked: data.ai_assistant,
                disabled: data.ai_assistant_expires_at && new Date(data.ai_assistant_expires_at) > new Date()
              };
            }
            if (feature.nameKey === 'diseaseDetection') {
              return {
                ...feature,
                checked: data.disease_detection,
                disabled: data.disease_detection_expires_at && new Date(data.disease_detection_expires_at) > new Date()
              };
            }
            if (feature.nameKey === 'streaming') {
              return {
                ...feature,
                checked: data.hardware_streaming,
                disabled: data.hardware_streaming_expires_at && new Date(data.hardware_streaming_expires_at) > new Date()
              };
            }
            return feature;
          })
        );
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const increment = (field) => handleChange(field, parseInt(formData[field]) + 1);
const minLandProfiles = currentSubscription.landProfiles || 0;

const decrement = (field) => {
  setFormData(prev => {
    const newValue = Math.max(minLandProfiles, parseInt(prev[field]) - 1);
    return { ...prev, [field]: newValue };
  });
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  const numericValue = Math.max(minLandProfiles, parseInt(value) || minLandProfiles);
  handleChange(name, numericValue);
};

  const handleFeatureCheck = (index) => {
    setExtraFeatures(prev =>
      prev.map((feature, i) =>
        i === index ? { ...feature, checked: !feature.checked } : feature
      )
    );
  };

  const grandTotal = useMemo(() => {
    if (isSubscribed) {
      const newLandProfiles = Math.max(0, formData.landProfiles);
      const diffLandProfiles = newLandProfiles - currentSubscription.landProfiles;
      const aiAssistantChecked = extraFeatures.find(f => f.nameKey === "aiAssistant")?.checked || false;
const diseaseDetectionChecked = extraFeatures.find(f => f.nameKey === "diseaseDetection")?.checked || false;
const hardwareStreamingChecked = extraFeatures.find(f => f.nameKey === "streaming")?.checked || false;


      const diffAiAssistant = aiAssistantChecked && !currentSubscription.aiAssistant ? 1 : 0;
      const diffDiseaseDetection = diseaseDetectionChecked && !currentSubscription.diseaseDetection ? 1 : 0;
      const diffHardwareStreaming = hardwareStreamingChecked && !currentSubscription.hardwareStreaming ? 1 : 0;

      const priceForLandProfiles = 5 * Math.max(0, diffLandProfiles);
      const priceForFeatures =
        diffAiAssistant * 150 +
        diffDiseaseDetection * 90 +
        diffHardwareStreaming * 60;

      return priceForLandProfiles + priceForFeatures;
    } else {
      const additionalPrice = extraFeatures
        .filter(f => f.checked)
        .reduce((sum, f) => sum + f.price, 0);
      const landProfilePrice = 5 * Math.max(0, formData.landProfiles);
      return additionalPrice + landProfilePrice;
    }
  }, [extraFeatures, formData.landProfiles, isSubscribed, currentSubscription]);

  const handleSubscriptionBuy = async () => {
    if (!stripe || !elements) {
      alert(t('stripeNotLoaded'));
      return;
    }

    
        const selectedLandProfiles = parseInt(formData.landProfiles);  
    const currentLandProfiles = currentSubscription.landProfiles; 

    if (selectedLandProfiles < currentLandProfiles) {
      alert(t('cannotReduceLandProfiles'));
      return;
    }
    if (grandTotal === 0) {
      alert(t('noChangesToPayFor'));
      return;
    }
    setIsLoading(true);
    const amountInCents = Math.round(grandTotal * 100);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert(t('cardDetailsMissing'));
       setIsLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
 const now = new Date();

const features = {
  land_profiles_allowed: parseInt(formData.landProfiles) + 1,
  ai_assistant:
    extraFeatures.find(f => f.nameKey === "aiAssistant")?.checked &&
    (!currentSubscription.aiAssistant || new Date(currentSubscription.aiAssistantExpiresAt) < now),
  disease_detection:
    extraFeatures.find(f => f.nameKey === "diseaseDetection")?.checked &&
    (!currentSubscription.diseaseDetection || new Date(currentSubscription.diseaseDetectionExpiresAt) < now),
  hardware_streaming:
    extraFeatures.find(f => f.nameKey === "streaming")?.checked &&
    (!currentSubscription.hardwareStreaming || new Date(currentSubscription.hardwareStreamingExpiresAt) < now),
};
    try {
      const res = await fetch('http://127.0.0.1:8000/api/create-payment-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ amount: amountInCents, currency: 'usd' }),
      });
      if (!res.ok) throw new Error('Failed to create payment intent');
      const { clientSecret } = await res.json();
      

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {},
        },
      });
      if (error) {
        alert(t('paymentFailed', { message: error.message }));
        setIsLoading(false);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        const activateRes = await fetch('http://127.0.0.1:8000/api/activate-subscription/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify(features),
        });
        if (!activateRes.ok) {
          alert(t('activationFailed'));
          setIsLoading(false);
          return;
        }
        alert(t('paymentSuccess'));
        await fetchSubscription();
      }
    } catch (error) {
      alert(t('error', { message: error.message }));
    }
    setIsLoading(false);
  };

  const handleHardwareBuy = async () => {
    if (quantity === 0) {
      alert(t('selectAtLeastOneHardware'));
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/hardware-requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ kits: quantity, type: "hardware" }),
      });
      if (response.ok) {
        alert(t('hardwareRequestSuccess'));
        await fetchSubscription();
        setQuantity(0);
      } else {
        alert(t('hardwareRequestFailed'));
      }
    } catch (error) {
      console.error(error);
      alert('Error sending request.');
    }
  };

  const handleReservation = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/hardware-requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ kits: 1, type: "setup" }),
      });
      if (response.ok) {
        alert(t('reservationSuccess'));
        
      } else {
        alert(t('reservationFailed'));
      }
    } catch (error) {
      console.error(error);
      alert('Error sending reservation.');
    }
  };
  

  return (
    
    <div>
      <NavbarWithNotification unreadHardwareCount={unreadCount} />

      <div className='landing_1' dir={isRTL ? "rtl" : "ltr"} style={{ textAlign: isRTL ? 'right' : 'left' }}>
        <Container>
          <Row className="align-items-start">
            <Col md={6} className="mt-4">
              <img
                src={Image_1}
                alt="Hardware"
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                }}
              />
              <div className="mt-4">
                <p className="text-start">
                      <strong style={{ color: "red" }}>{t('note')}:</strong>{' '}
                      {t('hardwareNote')}
                </p>
              </div>
            </Col>
            <Col md={6} className="mt-4">
              <h2 style={{ textAlign: isRTL ? 'right' : 'left' }}>{t('hardware')}</h2>
              <h5 style={{ textAlign: isRTL ? 'right' : 'left' }} className="text-danger">$1020</h5>
<p style={{ textAlign: "justify" }}>
{t('deviceDescription')}
              </p>
              <div className="d-flex align-items-center mb-3" style={{ gap: "10px" }}>
                <Button variant="outline-danger" className="rounded-pill d-flex align-items-center" style={{ maxHeight:"30px" }} onClick={() => setQuantity(q => Math.max(0, q - 1))}>-</Button>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mx-2 rounded-pill"
                  style={{ width: "60px", textAlign: "center" }}
                />
                <Button variant="outline-success" className="rounded-pill d-flex align-items-center" style={{ maxHeight:"30px" }} onClick={() => setQuantity(q => q + 1)}>+</Button>
                <h5 className="mb-0 ms-3">{t('totalPrice')}:<strong>${totalPrice}</strong></h5>
              </div>
              <div className="d-flex flex-column gap-2">
                <Button variant="secondary" onClick={handleHardwareBuy}>{t('buyNow')}</Button>
                <Button
                  style={{
                    background: "linear-gradient(to right, rgb(66, 82, 8), rgb(129, 129, 5))",
                    border: "none",
                    fontWeight: "bold",
                  }}
                  onClick={handleReservation}
                >
                  {t('setupReservation')}
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="py-5" dir={isRTL ? "rtl" : "ltr"} style={{ textAlign: isRTL ? 'right' : 'left' }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={10} lg={10}>
              <div className="p-5 rounded shadow-sm ">

  <div className="d-flex justify-content-center align-items-center mb-5">
   
  </div>

  <h1 className="fw-bold mb-5 text-center" style={{ color: "olive" }}>
    {t('subscribeTitle')}
  </h1>

                <Form className='w-100'>
                  {isLoading && (
  <>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`
      }
    </style>

    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'black',
        opacity: 0.8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          border: '10px solid #f3f3f3',
          borderTop: '10px solid rgb(31, 160, 57)',
          borderRadius: '50%',
          animation: 'spin 2s linear infinite',
        }}
      />
    </div>
  </>
)}
                  <div className="d-flex align-items-center justify-content-between mb-4 w-100 flex-wrap">
                    <div className={`fs-3 d-flex w-50 ${isRTL ? 'text-end' : 'text-start'}`}style={{ flex: 1 }}>
                      <div className="fs-3 w-100" style={{ color: "olive" }}>• {t('landProfiles')}</div>
                      <div className="d-flex ms-5 me-5 align-items-center"> 
                        <Button variant="outline-danger" className="rounded-pill m-1 d-flex align-items-center" style={{ maxHeight:"30px" }} onClick={() => decrement("landProfiles")}>-</Button>
                        <input
                        type="number"
                        name="landProfiles"
                        value={formData.landProfiles}
                        onChange={handleInputChange}
                        className="m-1 rounded-pill"
                        style={{ width: "60px", textAlign: "center", maxHeight:"30px", direction:"ltr" }}
                        min={minLandProfiles}
                        />
                        <Button variant="outline-success" className="rounded-pill m-1 d-flex align-items-center" style={{ maxHeight:"30px" }} onClick={() => increment("landProfiles")}>+</Button>
                      </div>
                      </div>
                      
                      <div className={`d-flex gap-3 align-items-center ${isRTL ? 'ms-0 me-auto' : 'me-0 ms-auto'}`} style={{ minWidth: "110px" }}>
                        <div className="fs-5">5$   </div>


                      </div>
                  </div>

                  {extraFeatures.map((feature, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between mb-4 w-100 flex-wrap">
                      <div className={`fs-3 ${isRTL ? 'text-end' : 'text-start'}`} style={{ color: "olive", flex: 1 }}>
                        • {t(feature.nameKey)}
                      </div>
                      
                      <div className="d-flex align-items-center gap-3" style={{minWidth:"110px"}}>
                        <div className="fs-5">{feature.price}$</div>
                        <Form.Check
                          checked={feature.checked}
                          onChange={() => handleFeatureCheck(i)}
                          disabled={feature.disabled}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="mb-4 text-center">
                    <label style={{ color: 'olive', fontWeight: 'bold' }}>{t("payment.enterCardDetails")}</label>
                    <div style={{
                      border: '1px solid #ced4da',
                      padding: '20px',
                      borderRadius: '10px',
                      minHeight: '60px',
                      minWidth: '600px',
                      fontSize: '18px', 
                    }}>
                      <CardElement options={{ style: { base: { fontSize: '18px' , color: isDarkMode ? 'white' : 'black'} }, hidePostalCode: true }} />
                    </div>
                  </div>

                  <div className="d-flex justify-content-around w-100 pt-4 mt-4 border-top">
                    <h5 className="mb-0 fs-3 fw-bold" style={{ color: "olive" }}>
                      {t('totalPrice')}: {grandTotal.toFixed(2)} $/ {t('payment.year')}
                    </h5>
                    <button type="button" className="btn main-btn rounded-pill px-4" onClick={handleSubscriptionBuy}>
                      {t('buyNow')}
                    </button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Footer />
    </div>
  );
}