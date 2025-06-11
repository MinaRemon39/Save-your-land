import React from 'react';
import Card from 'react-bootstrap/Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Article({ articleId, articleImg, articleName, articleBody, articleAuthor, articleAuthorName }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function handleSeeMore() {
    navigate(`/articlespage/openedarticlepage/${articleId}`);
  }

  return (
    <Card className="article-card  rounded border-1 overflow-hidden text-start" style={{ height: '350px', position: 'relative' }}>
      <div className="img-top d-flex justify-content-center" style={{ flex: '.5', paddingTop: '10px' }}>
        {articleAuthor && (
          <img
            src={articleAuthor}
            className="rounded-circle mb-3"
            alt="Author"
            style={{
              width: '80px',
              height: '85px',
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      <Card.Body className="d-flex flex-column text-white" style={{ padding: '0 1rem', flex: 1, position: 'relative' }}>
        <div className="text-center mb-2">
          <h5 className="fw-semibold mt-2" style={{ color: '#6c757d', fontSize: '0.95rem' }}>
            {articleAuthorName}
          </h5>
          <h5 className="mb-2 text-black-50" style={{ fontSize: '1rem' }}>
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