import { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ProfileArticle from './ProfileArticle';

export default function ArticleOfProfile({ articles }) {
  const [visibleCount, setVisibleCount] = useState(2); 
  useEffect(() => {
    const handleScroll = () => {
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (bottom && visibleCount < articles.length) {
        setVisibleCount(prev => prev + 2); 
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, articles.length]);

  const visibleArticles = articles.slice(0, visibleCount); 

  return (
    <div className="articles pt-5 pb-5">
      <Container>
        <Row>
          {visibleArticles.map((article, index) => {
            const articleImg = (
              <div className="img-top d-flex justify-content-center">
                <img
                  src={`http://localhost:8000${article.author_profile?.profile_pic}`}
                  className="mt-3 mb-3"
                  alt=""
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            );

            return (
              <Col key={index} lg={6} md={6} className="p-3">
                <ProfileArticle
                  articleId={article.id}
                  articleImg={articleImg}
                  articleName={article.title}
                  articleBody={article.content}
                  articleAuthorName={article.author_name}
                />
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
}