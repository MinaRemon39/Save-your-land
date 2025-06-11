import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Article from './Article';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
const { t } = useTranslation();
const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
const align = dir === 'rtl' ? 'text-end' : 'text-start';
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/articles/')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch articles');
        }
        return res.json();
      })
      .then(data => {
        const uniqueArticles = Array.from(new Set(data.map(a => a.id)))
          .map(id => data.find(a => a.id === id));
        
        setArticles(uniqueArticles);
        setLoading(false);  
      })
      .catch(err => {
        setError(err.message);  
        setLoading(false);  
      });
  }, []);


if (loading) {
  return (
            <div className="pt-5 pb-5">
                <Container>
                    <Loader />
                </Container>
            </div>
  );
}

  if (error) {
    return (
      <div className="text-center pt-5">
        <h3 style={{ color: 'red' }}>Error: {error}</h3>
      </div>
    );
  }

  return (
    <div className="articles pt-5 pb-5" dir={dir}>
      <Container>
        {articles.length === 0 ? (
          <div className="no-articles-message" style={{ textAlign: 'center', padding: '20px', fontSize: '1.2rem', color: 'gray' }}>
            {t("noArticles")}

          </div>
        ) : (
          <Row>
            {articles.map(article => (
              <Col lg={6} md={6} className="p-3" key={article.id}>
                <Article
                  articleImg={article.image ? `${article.image}` : null}
                  articleName={article.title}
                  articleBody={article.content}
                  articleAuthor={article.author_profile?.profile_pic ? `http://127.0.0.1:8000${article.author_profile.profile_pic}` : null}
                  articleAuthorName={article.author_name}
                  articleId={article.id}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
