import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Image_2 from './Images/photo_2024-12-27_23-10-23.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import NavbarWithNotification from './NavbarWithNotification';
import Container from 'react-bootstrap/Container';
import Loader from './Loader';
import {
  Row,
  Col
} from 'react-bootstrap';
import DOMPurify from 'dompurify';

export default function OpenedArticlePage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);  
  const [articleLoadFailed, setArticleLoadFailed] = useState(false);
  const token = localStorage.getItem('token');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");


useEffect(() => {
  const fetchArticle = fetch(`http://127.0.0.1:8000/api/articles/${articleId}/`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch article');
      }
      return res.json();
    })
    .then(dataArticle => {
      setArticle(dataArticle);
      setArticleLoadFailed(false);
    })
    .catch(err => {
      console.error('Error fetching article:', err);
      setArticleLoadFailed(true);
    });

  const fetchFavorites = fetch(`http://127.0.0.1:8000/api/favorites/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  })
    .then(res => res.json())
    .then(favoritesData => {
      const fav = favoritesData.find((item) => item.article === parseInt(articleId));
      if (fav) {
        setIsLiked(true);
        setFavoriteId(fav.id);
      }
    })
    .catch(err => {
      console.error('Error fetching favorites:', err);
    });

  Promise.all([fetchArticle, fetchFavorites]).finally(() => {
    setLoading(false);
  });
}, [articleId, token]);



  const handleLikeClick = () => {
    if (!isLiked) {
      fetch('http://localhost:8000/api/favorites/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          article: article.id,  
          user: parseInt(localStorage.getItem('user_id'))
        }),
      })
      .then(res => res.json())
      .then(data => {
        setIsLiked(true);
        setFavoriteId(data.id); 
      })
      .catch(err => {
        console.error('Error adding to favorites:', err);
      });
    } else {
      fetch(`http://127.0.0.1:8000/api/favorites/${favoriteId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(errorData => {
              console.error('Error removing from favorites:', errorData);
              throw new Error(errorData.detail || 'Error removing from favorites');
            });
          }
        })
        .then(() => {
          setIsLiked(false);
          setFavoriteId(null);
        })
        .catch(err => {
          console.error('Error:', err);
        });
    }
  };

  const handleRatingClick = (index) => {
    setRating(index + 1);
  };

if (loading) {
  return (
    <div className="articles pt-5 pb-5">
      <Container>
        <Loader />
      </Container>
    </div>
  );
}

if (articleLoadFailed) {
  return (
    <div className="articles pt-5 pb-5">
      <Container>
        <p>Article not found or failed to load.</p>
      </Container>
    </div>
  );
}
  return (
<div>
<NavbarWithNotification />
    <div className='pt-4'>
      <div className="container">
        <h3>{article.title}</h3>
        <div className="row p-4 mb-3">
          <div className="col-lg-6">
            <div className="img-top bg-transparent d-flex">
              <img
                src={article.author_profile?.profile_pic ? `http://127.0.0.1:8000${article.author_profile.profile_pic}` : Image_2}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
className="me-5 hover-zoom"
                alt="author profile"
              />
              <div className='fw-bold text-start mt-5'>
                <h5 className='mb-3'>{article.author_name}</h5>
                <h5>{article.created_at ? new Date(article.created_at).toLocaleDateString() : 'Date not available'}</h5>
              </div>
            </div>
          </div>
          <div className="col-lg-6 d-flex align-items-center justify-content-end">
            <button className="btn btn-link text-decoration-none " onClick={handleLikeClick} style={{ color: isDarkMode ? 'white' : 'black' }}>
              <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} className={`me-3 ${isLiked ? 'text-danger' : ''}`} size="lg" />
            </button>
          </div>
        </div>

<Row>
  <Col lg={12}>
    <div className="clearfix">
{article.image && (
  <img
    src={article.image}
    alt=""
    className="float-end ms-3 mb-2"
    style={{
      maxWidth: "500px",
      maxHeight: "500px",
      objectFit: "contain",
      display: article.image ? "block" : "none",
    }}
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />
)}
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(article.content || '<p>Content is not available.</p>'),
        }}
      />
    </div>
  </Col>
</Row>
        </div>
      </div>
    </div>
    
  );
}