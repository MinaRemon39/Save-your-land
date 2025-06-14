import React from 'react';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Image_2 from './Images/photo_2024-12-27_23-10-23.jpg';
import { useTranslation } from 'react-i18next';

export default function WhatILove({ articles }) {
    const { t } = useTranslation();
  const navigate = useNavigate();

  function handleSeeMore(articleId) {
    navigate(`/articlespage/openedarticlepage/${articleId}`);
  }

   return (
    <div className="articles pt-5 pb-5">
      <div className="container">
        <div className="row">
          {articles.map((article) => {
            const articleImg = (
              <img
                src={
                  article.author_profile && article.author_profile.profile_pic
                    ? `http://127.0.0.1:8000${article.author_profile.profile_pic}`
                    : Image_2
                }
                alt="Author Profile"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            );

            return (
              <div key={article.id} className="col-lg-6 col-md-6 p-3">
                <Card
                  className="article-card rounded border-dark border-1 overflow-hidden text-start"
                  style={{ height: '350px', position: 'relative' }}
                >
                  
                  <div
                    className="position-absolute top-0 end-0 p-2"
                    style={{ zIndex: 10, cursor: 'pointer' }}
                  >
                    <FontAwesomeIcon icon={faHeartSolid} className="text-danger fs-4" />
                  </div>

                  
                  <div className="img-top d-flex justify-content-center" style={{ flex: '.5', paddingTop: '10px' }}>
                    {articleImg}
                  </div>

                  <Card.Body
                    className="d-flex flex-column"
                    style={{ padding: '0 1rem', flex: 1, position: 'relative' }}
                  >
                    <div className="text-center mb-2">
                      <h5 className="fw-semibold mt-3" style={{ color: "rgb(152, 170, 113)", fontSize: '0.95rem' }}>
                        {article.author_name}
                      </h5>
                      <h5 className="mb-2" style={{ fontSize: '1rem' }}>
                        {article.title}
                      </h5>
                    </div>

<div
  className="card-text mb-2 overflow-hidden "
  style={{
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    minHeight: '4.5em',
  }}
  dangerouslySetInnerHTML={{ __html: article.content }}
/>

                    <div
                      className="d-flex justify-content-end"
                      style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                    >
                      <button
                        onClick={() => handleSeeMore(article.article)}
                        className="btn main-btn rounded-pill"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {t("article.seeMore")}
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

