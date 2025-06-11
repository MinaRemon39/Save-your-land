import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LandImg1 from './Images/Property 1=Default.png';
import LandImg2 from './Images/Property 1=Variant2.png';
import LandImg3 from './Images/Property 1=Variant3.png';
import { Carousel } from 'react-bootstrap';
import NavbarWithNotification from './NavbarWithNotification';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';


export default function LandS() {
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user_id = localStorage.getItem("user_id");
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { t } = useTranslation();


    useEffect(() => {
        fetchLands();
    }, []);


    const fetchPlantStatus = async (land) => {
    try {
        const response = await fetch("http://localhost:8001/plant-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                soil_moisture: land.soilMoisture,
                nitrogen_level: land.nitrogenLevel
            })
        });

        if (!response.ok) {
            throw new Error("Failed to fetch plant status");
        }

const data = await response.json();
        const status = data.Response;
        await fetch(`http://localhost:8000/api/update-plant-status/${land.id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ plant_status: status }),
        });

        return status;
    } catch (error) {
        console.error("Error fetching or saving plant status:", error);
        return "Unknown";
    }
};




const fetchLands = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/lands/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        }
    })
    .then(response => response.json())
    .then(async (data) => {
        const landsWithStatus = await Promise.all(data.map(async (land) => {
            const status = await fetchPlantStatus(land);
            return { ...land, status };
        }));

        setLands(landsWithStatus);
        setLoading(false);

        if (landsWithStatus.length === 0) {
            navigate('/chat');
        }
    })
    .catch(error => {
        setLoading(false);
    });
};

    const handleDelete = (id) => {
        fetch(`http://localhost:8000/api/lands/${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${localStorage.getItem('token')}`,
            }
        })
        .then(response => {
            if (response.ok) {
                setLands(prevLands => {
                    const newLands = prevLands.filter(land => land.id !== id);
                    checkLandsAndNavigate(newLands);
                    return newLands;
                });
            } else {
                console.error('Failed to delete land');
            }
        })
        .catch(error => console.error('Error deleting land:', error));
    };
    

const handleAddLandClick = () => {
  const userType = localStorage.getItem('user_type');

  if (userType === 'administrator') {
    navigate('/chat', { state: { isAddingNewLand: true } });
    return;
  }

  fetch('http://localhost:8000/api/subscription/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${localStorage.getItem('token')}`
    }
  })
  .then(res => res.json())
.then(data => {
  if (data.can_add_land) {
    navigate('/chat', { state: { isAddingNewLand: true } });
  } else {
    alert(t('errorLimitReached'));
  }
})
  .catch(err => {
    console.error('Error checking subscription:', err);
    alert('Error verifying subscription. Please try again later.');
  });
};

    const checkLandsAndNavigate = (updatedLands) => {
        if (updatedLands.length > 0) {
            navigate('/chat/lands');
        } else {
            navigate('/chat');
        }
    };

    const handleChatClick = () => {
        fetch('http://localhost:8000/api/lands/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${localStorage.getItem('token')}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                navigate('/chat/lands');
            } else {
                navigate('/chat');
            }
        })
        .catch(error => console.error('Error fetching lands:', error));
    };

const getStatus = (land) => {
    return land.status || "Unknown";
};

    const [isChoosing, setIsChoosing] = useState(false);

useEffect(() => {
    const awaiting = localStorage.getItem("awaitingLandSelection");
    setIsChoosing(awaiting === "true");
}, []);
    
const handleChoose = (landId) => {
    const image = localStorage.getItem("newDiseaseImage");
    const disease = localStorage.getItem("detectedDisease");
    const land = lands.find(l => l.id === landId);
    const user_id = localStorage.getItem("user_id");

    if (disease && land && user_id) {
        const payload = {
            disease_name: disease
        };

        fetch(`http://localhost:8001/add-disease-to-land/${user_id}/${landId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to add disease to land');
            return res.json();
        })
        .then(data => {
            //console.log('Disease added:', data);
            alert(t('landsPage.diseaseSuccess'));
        })
        .catch(err => {
            console.error(err);
            alert(t('landsPage.diseaseError'));
        });
            const updatedLands = lands.map((land) =>
            land.id === landId
                ? { ...land, diseaseImages: [...(land.diseaseImages || []), image] }
                : land
        );

        localStorage.setItem("lands", JSON.stringify(updatedLands));
        localStorage.removeItem("newDiseaseImage");
        localStorage.removeItem("awaitingLandSelection");
        localStorage.removeItem("detectedDisease");

        setIsChoosing(false);
    } else {
        alert(t('landsPage.missingData'));
    }
        const updatedLands = lands.map((land) =>
        land.id === landId
            ? { ...land, diseaseImages: [...(land.diseaseImages || []), image] }
            : land
    );



    localStorage.setItem("lands", JSON.stringify(updatedLands));
    localStorage.removeItem("newDiseaseImage");
    localStorage.removeItem("awaitingLandSelection");
    localStorage.removeItem("detectedDisease"); 
    
    setIsChoosing(false);
};

    
    
    
      const location = useLocation();
    useEffect(() => {
        if (location.hash) {
          setTimeout(() => {
            const target = document.querySelector(location.hash);
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }, 0); 
        }
      }, [location]);

      return (
        <div >
<NavbarWithNotification />

            <div className="imageprofile" dir={isRTL ? 'rtl' : 'ltr'}>
                <Carousel className='carousel-dark active d-flex justify-content-center align-items-center'   indicators={false}>
                    {[LandImg1, LandImg2, LandImg3].map((img, index) => (
                        <Carousel.Item key={index}>
                            <img
                                src={img}
                                alt={`${t('landsPage.title')} ${index + 1}`}
                                className="d-block w-100"
                                style={{  objectFit: 'cover' }}
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
                {/* <div className="content position-absolute bottom-0 start-0 p-3 text-uppercase text-start" >
                    <h1 className="mb-4">{t('landsPage.title')}</h1>
                </div>          */}
                <div className={`content position-absolute bottom-0 ${isRTL ? 'end-0 text-end' : 'start-0 text-start'} p-3 text-uppercase`}>
  <h1 className="mb-4">{t('landsPage.title')}</h1>
</div>

            </div>
            <Container className="pt-5" id='my_choose'>
                <Row>
                    
  {loading ? (
    <Col md={12} className="text-center">
      <Loader />
    </Col>
  ) : (
    lands.length > 0 ? (
      lands.map((land, idx) => (
                            <Col md={6} key={idx} className="mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
                                {/* <Card className="p-3 shadow-sm">
                                    <Row className="align-items-center text-start mb-4">
                                        <Col xs={6}><strong>{t('landsPage.landName')}:</strong> {land.landName}</Col>
                                        <Col xs={6}><strong>{t('landsPage.status')}:</strong> {getStatus(land)}</Col>
                                        <hr />
                                    </Row>
                                    <div className="d-flex gap-2">
                                        {isChoosing ? (
                                    <button className="btn main-btn mx-auto rounded-pill" onClick={() => handleChoose(land.id)}>{t('landsPage.choose')}</button>
                                            ) : (
                                                <>
                                        <Button
                                        variant="outline-dark"
                                        className={`rounded-pill ${isRTL ? 'ms-3' : 'me-3'}`}
                                        onClick={() => navigate('/chat', { state: { landToEdit: land } })}
                                        >
                                         {t('landsPage.edit')}
                                        </Button>
                                        <button className={`btn main-btn rounded-pill ${isRTL ? 'ms-3' : 'me-3'}`} onClick={() => navigate('/chat/chatbot', { state: { land } })}>
                                            {t('landsPage.chat')}
                                        </button>
                            
                                                    <div className="ms-auto">
                                                        <button className="btn" onClick={() => handleDelete(land.id)} >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </>
                                        )}
                                    </div>
                                </Card> */}
                                <Card className="article-card p-3 shadow-sm">
  <Row className={`align-items-center ${isRTL ? 'text-end' : 'text-start'} mb-4`}>
    <Col xs={6}>
      <strong>{t('landsPage.landName')}:</strong> {land.landName}
    </Col>
    <Col xs={6}>
      <strong>{t('landsPage.status')}:</strong> {getStatus(land)}
    </Col>
    <hr />
  </Row>

  <div className={`d-flex ${isRTL ? 'justify-content-end' : 'justify-content-start'} flex-wrap gap-2`}>
    {isChoosing ? (
      <button className="btn main-btn mx-auto rounded-pill" onClick={() => handleChoose(land.id)}>
        {t('landsPage.choose')}
      </button>
    ) : (
      <>
        <Button
          variant="outline-dark"
          className={`rounded-pill ${isRTL ? 'ms-2' : 'me-2'}`}
          onClick={() => navigate('/chat', { state: { landToEdit: land } })}
        >
          {t('landsPage.edit')}
        </Button>
        <button
          className={`btn main-btn rounded-pill ${isRTL ? 'ms-2' : 'me-2'}`}
          onClick={() => navigate('/chat/chatbot', { state: { land } })}
        >
          {t('landsPage.chat')}
        </button>

        <div className={`${isRTL ? 'me-auto' : 'ms-auto'}`}>
          <button className="btn" onClick={() => handleDelete(land.id)}>
            🗑️
          </button>
        </div>
      </>
    )}
  </div>
</Card>

                            </Col>
      ))
    ) : (
      <Col md={12}>
        <p>No lands available. Please add some lands first.</p>
      </Col>
    )
  )}
                </Row>
<button 
  className="btn main-btn rounded-pill my-4" 
  onClick={handleAddLandClick}
>
  {t("landsPage.addLand")}
</button>

            </Container>
            <Footer />
        </div>
    );
}
