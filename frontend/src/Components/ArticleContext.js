import React, { createContext, useContext, useState } from 'react';

export const ArticleContext = createContext();

export const ArticleProvider = ({ children }) => {
  const [publishedArticles, setPublishedArticles] = useState([]);

  const addArticle = (newArticle) => {
    setPublishedArticles([...publishedArticles, newArticle]);
  };

  return (
    <ArticleContext.Provider value={{ publishedArticles, addArticle }}>
      {children}
    </ArticleContext.Provider>
  );
};