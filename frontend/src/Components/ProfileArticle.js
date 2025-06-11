import React from 'react';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function ProfileArticle({
  articleId,
  articleImg, 
  articleName,
  articleAuthorName,
  articleBody,
}) {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const navigate = useNavigate();

  function handleDelete() {
    const confirmDelete = window.confirm(t('confirmDelete'));
    if (confirmDelete) {
      fetch(`http://127.0.0.1:8000/api/articles/${articleId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to delete the article.');
        window.location.reload();
      })
      .catch((error) => {
        alert('Error deleting article: ' + error.message);
      });
    }
  }

  function handleEdit() {
    navigate(`/editpublish/${articleId}`);
  }

  function handleSeeMore() {
    navigate(`/articlespage/openedarticlepage/${articleId}`);
  }

  return (
    <Card className=" article-card rounded border-dark border-1 overflow-hidden text-start" style={{ height: '350px', position: 'relative' }}>
      
      <div className="position-absolute top-0 end-0 p-2 d-flex gap-2" style={{ color: isDarkMode ? 'black' : 'white' }}>
        <button className="fs-5  bg-transparent border-0" onClick={handleEdit}>
          <FontAwesomeIcon icon={faPen} />
        </button>
        <button className="fs-5  bg-transparent border-0" onClick={handleDelete}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      </div>

      <div className="img-top d-flex justify-content-center" style={{ flex: '.5', paddingTop: '10px' }}>
        {typeof articleImg === 'string' ? (
          <img
            src={articleImg}
            alt="Article"
            style={{ maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', maxWidth: '100%' }}
          />
        ) : (
          articleImg || null
        )}
      </div>

      <Card.Body className="card-text d-flex flex-column" style={{ padding: '0 1rem', flex: 1, position: 'relative' }}>
        
        <div className="text-center mb-2">
          <h5 className="fw-semibold mt-3" style={{ color: '#6c757d', fontSize: '0.95rem' }}>
            {articleAuthorName}
          </h5>
          <h5 className="text-black-50 mb-2" style={{ fontSize: '1rem' }}>
            {articleName}
          </h5>
        </div>

        
<div
  className="card-text mb-2 overflow-hidden text-black-50"
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
  dangerouslySetInnerHTML={{ __html: articleBody }}
/>

        <div className="d-flex justify-content-end" style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
          <button onClick={handleSeeMore} className="btn main-btn rounded-pill" style={{ fontSize: '0.8rem' }}>
            {t("article.seeMore")}
          </button>
        </div>
      </Card.Body>
    </Card>
  );
}