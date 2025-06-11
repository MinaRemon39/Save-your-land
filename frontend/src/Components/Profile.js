import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ArticleOfProfile from './ArticleOfProfile';
import FavouriteArticleList from './FavouriteArticle';
import NavbarWithNotification from './NavbarWithNotification';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';

export default function Profile() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const token = localStorage.getItem('token');
    const [lovedArticles, setLovedArticles] = useState([]);
    const [articlesLoading, setArticlesLoading] = useState(true);
    const [lovedLoading, setLovedLoading] = useState(true);

    useEffect(() => {
        if (token) {
          setLovedLoading(true);
          fetch('http://localhost:8000/api/favorites/', {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            }
          })
            .then(response => response.json())
            .then(data => {
              setLovedArticles(data);
              //console.log("Loved Articles:", data);
        })
        .catch(error => console.error('Error fetching loved articles:', error))
        .finally(() => setLovedLoading(false));
    }
}, [token]);

    useEffect(() => {
        fetchUserData();
    }, []);
    
    const fetchUserData = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("No token found, please log in.");
            return;
        }
    
        fetch('http://localhost:8000/api/profile/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            setUserData(data);
            //console.log("User Data:", data);
    
            if (data && (data.user_type === 'publisher' || data.user_type === 'administrator')) {
              setArticlesLoading(true);
              fetch('http://localhost:8000/api/articles/', {
                headers: { 'Authorization': `Token ${token}` }
              })
              .then(response => response.json())
              .then(articlesData => {
                
                const filteredArticles = data.user_type === 'administrator' ? 
                  articlesData : 
                  articlesData.filter(article => article.author_name === data.username);
                setArticles(filteredArticles);
              })
              .finally(() => setArticlesLoading(false));
            }
})
        .catch(error => {
            console.error(error);
            setError(t("profile.fetchError"));
        })
        .finally(() => {
            setLoading(false);
        });
    };
    
    const profilePicPath = userData?.profile?.profile_pic?.replace('.png.png', '.png');
    
    return (
        <div>
<NavbarWithNotification />
    
            <div className="profile pt-5 pb-5" >
                <Container>
                          {loading ? (
          <div className="text-center my-5">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center text-danger my-5">{error}</div>
        ) : (
          <>
                    <Row>
                    <Col lg={3} md={5}>
                        <div style={{ height: '290px', width: '90%' }} className="img-top anim bg-transparent">
                            <img src={profilePicPath ? `http://localhost:8000${profilePicPath}` : 'http://localhost:8000/media/profile_pics/user.png'} 
                                className="w-100 h-100" 
                                alt="Profile" 
                                style={{ objectFit: 'cover' }} />
                        </div>
                    </Col>
                        <Col lg={7} md={5}>
                            <h5 className="fw-bold text-start">{t('profile.name')}</h5>
                            <h6 className="mb-3 text-start">{userData?.username || 'N/A'}</h6>
                            <h5 className="fw-bold text-start">{t("profile.date")}</h5>
                            <h6 className="mb-3 text-start">{userData?.date_joined ? new Date(userData.date_joined).toLocaleDateString() : 'N/A'}</h6>
                            <h5 className="fw-bold text-start">{t("profile.status")}</h5>
                            <h6 className="mb-3 text-start">{userData?.user_type || 'N/A'}</h6>
                            <h5 className="fw-bold text-start">{t("profile.description")}</h5>
                            <h6 className="text-start">{userData?.profile?.bio ||  t("profile.noBio")}</h6>
                        </Col>
                        <Col lg={2}>
                            <div className="edit d-flex justify-content-end align-items-end">
                                <Link className="fw-bold fs-3" style={{ textDecoration: "none" }} to="/profile/edit">{t("profile.edit")}</Link>
                                <a className="edit fs-5 ms-1" href="#m">
                                    <FontAwesomeIcon icon={faPen} />
                                </a>
                            </div>
                        </Col>
                    </Row>
    
                    {userData?.user_type?.trim().toLowerCase() === 'publisher' &&
 !articlesLoading && !lovedLoading &&
 lovedArticles.length === 0 && articles.length === 0 ? (
  <div className="mt-6 p-4 text-center rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', maxWidth: '5000px', margin: '100px auto', padding: '30px' }}>
    <i className="bi bi-journal-x" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
    <p className="text-muted mt-4 mb-3" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
      {t("profile.noPublishedArticles")}
    </p>
    <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
      {t("profile.noLovedArticles")}
    </p>
  </div>
) : (
  <>
    {(userData?.user_type?.trim().toLowerCase() === 'publisher' || userData?.user_type?.trim().toLowerCase() === 'administrator') && (
      <>
        <div className="carousel-container position-relative pt-5">
  <div className={`d-flex justify-content-between align-items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
    <h3 className="text-start" dir={isRTL ? 'rtl' : 'ltr'}>
      {t("profile.publishedSectionTitle")}
    </h3>
    <div className="d-flex gap-2">
      <button className="arrow-btn" type="button" data-bs-target="#publishCarousel" data-bs-slide="prev">
        <span>&larr;</span>
      </button>
      <button className="arrow-btn" type="button" data-bs-target="#publishCarousel" data-bs-slide="next">
        <span>&rarr;</span>
      </button>
    </div>
  </div>

  {articlesLoading ? (
    <div className="text-center py-4"><Loader /></div>
  ) : articles.length === 0 ? (
    <p className="text-muted" dir={isRTL ? 'rtl' : 'ltr'}>
      {t("profile.noPublishedArticles")}
    </p>
  ) : (
    <div id="publishCarousel" className="carousel carousel-dark slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {[...Array(Math.ceil((articles?.length || 0) / 2))].map((_, index) => {
          const articlePair = articles.slice(index * 2, index * 2 + 2);
          return (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
              <ArticleOfProfile articles={articlePair} />
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>

      </>
    )}

    <div className="carousel-container position-relative pt-5">
  <div className={`d-flex justify-content-between align-items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
    <h3 className="mt-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {t("profile.lovedSectionTitle")}
    </h3>
    <div className="d-flex gap-2">
      <button className="arrow-btn" type="button" data-bs-target="#loveCarousel" data-bs-slide="prev">
        <span>&larr;</span>
      </button>
      <button className="arrow-btn" type="button" data-bs-target="#loveCarousel" data-bs-slide="next">
        <span>&rarr;</span>
      </button>
    </div>
  </div>

  {lovedLoading ? (
    <div className="text-center py-4"><Loader /></div>
  ) : lovedArticles.length === 0 ? (
    <p className="text-muted" dir={isRTL ? 'rtl' : 'ltr'}>{t("profile.noLovedArticles")}</p>
  ) : (
    <div id="loveCarousel" className="carousel carousel-dark slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {[...Array(Math.ceil((lovedArticles?.length || 0) / 2))].map((_, index) => {
          const pair = lovedArticles.slice(index * 2, index * 2 + 2);
          return (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
              <div className="container">
                <FavouriteArticleList articles={pair} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>

  </>
)}

          </>
        )}
      </Container>
      
    </div>
    <Footer />
        </div>
    );
}

