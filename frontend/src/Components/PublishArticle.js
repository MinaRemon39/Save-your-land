import React, { useState, useRef, useEffect } from 'react';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTheme } from './ThemeContext';
import NavbarWithNotification from './NavbarWithNotification';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';

export default function PublishArticle() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [article, setArticle] = useState({ title: '', content: '', image: null });
  const [errorMessage, setErrorMessage] = useState('');
  const [image, setImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeFormats, setActiveFormats] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('p');
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('user_type');
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  // Throttle timeout ref for updating formats on input
  const updateFormatsTimeout = useRef(null);

const extractTextFromHtml = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};
const countWords = (htmlContent) => {
  const text = extractTextFromHtml(htmlContent);
  return (text.match(/[\p{L}\p{N}_]+/gu) || []).length;
};
  const applyTagToSelection = (tag) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  if (!selectedText) return;

  const newNode = document.createElement(tag);
  newNode.textContent = selectedText;

  range.deleteContents();
  range.insertNode(newNode);

  setTimeout(() => {
    updateActiveFormats();
    if (contentRef.current) {
      setArticle((prev) => ({
        ...prev,
        content: contentRef.current.innerHTML,
      }));
    }
  }, 10);
};


useEffect(() => {
  setLoading(true);
  if (userType !== "publisher" && userType !== "administrator") {
    navigate("/articlespage");
  } else {
    setLoading(false); 
  }
}, [navigate, userType]);

// Sync block style dropdown with selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const parentBlock = selection.getRangeAt(0).startContainer.parentNode;
      if (!parentBlock) return;

      const tagName = parentBlock.tagName?.toLowerCase();
      if (tagName === 'h1' || tagName === 'h2' ) {
        setSelectedStyle(tagName);
      } else {
        setSelectedStyle('p');
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);


  useEffect(() => {
  const update = () => updateActiveFormats();
  document.addEventListener('mouseup', update);
  document.addEventListener('keyup', update);

  return () => {
    document.removeEventListener('mouseup', update);
    document.removeEventListener('keyup', update);
  };
}, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArticle((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadNewImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setArticle((prev) => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setArticle((prev) => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };


  const updateActiveFormats = () => {
  const newFormats = [];

  // Inline formatting states
  if (document.queryCommandState('bold')) newFormats.push('bold');
  if (document.queryCommandState('italic')) newFormats.push('italic');
  if (document.queryCommandState('insertUnorderedList')) newFormats.push('insertUnorderedList');
  if (document.queryCommandState('insertOrderedList')) newFormats.push('insertOrderedList');

  // Block styles
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const node = selection.anchorNode;
    if (node) {
      const parent = node.nodeType === 3 ? node.parentElement : node;
      if (parent) {
        const tagName = parent.closest('h1, h2, blockquote, pre')?.tagName?.toLowerCase();
        if (tagName) newFormats.push(tagName);
      }
    }
  }

  setActiveFormats(newFormats);
};


const handleToolbarAction = (action, value = null) => {
  if (!contentRef.current) return;
  contentRef.current.focus();

  if (action === 'bold') {
    const isBold = document.queryCommandState('bold');
    if (!isBold) {
      document.execCommand('bold', false, null);
    } else {
      document.execCommand('bold', false, null); // Toggle off
    }
  } else if (action === 'createLink') {
    const url = prompt(t("publish.enterURL"));
    if (url) document.execCommand('createLink', false, url);
  } else if (action === 'insertHTML') {
    document.execCommand('insertHTML', false, value);
  } else {
    document.execCommand(action, false, value);
  }

  // Let formatting apply before checking state
  setTimeout(() => {
    updateActiveFormats();

    if (contentRef.current) {
      setArticle((prev) => ({
        ...prev,
        content: contentRef.current.innerHTML,
      }));
    }
  }, 10);
};

  const onContentInput = () => {
    if (updateFormatsTimeout.current) clearTimeout(updateFormatsTimeout.current);
    updateFormatsTimeout.current = setTimeout(() => {
      updateActiveFormats();
      if (contentRef.current) {
        setArticle((prev) => ({
          ...prev,
          content: contentRef.current.innerHTML,
        }));
      }
    }, 200);
  };
function countWords1(text) {
  if (!text) return 0;

  const words = text.trim().match(/[\p{L}\p{N}]+/gu);
  return words ? words.length : 0;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage('');

 const wordCount = countWords(article.content);
  if (!article.title || !article.content || article.content === '<p><br></p>') {
    setErrorMessage(t('publish.fillRequired'));
    return;
  }
  if (wordCount < 100 || wordCount > 1000) {
    setErrorMessage(t('publish.wordsLimit'));
    return;
  }


  if (!token) {
    alert(t('publish.loginRequired'));
    navigate('/login');
    return;
  }

    const formData = new FormData();
  formData.append('title', article.title);
  formData.append('content', article.content);
  if (article.image) formData.append('image', article.image);
  
  try {
    const response = await fetch('http://localhost:8000/api/articles/', {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      const errorValues = Object.values(data).flat().join(' ');
      setErrorMessage(errorValues || t('publish.failed'));
      return;
    }

     alert(t('publish.success'));
    navigate('/articlespage');
  } catch (error) {
    console.error('Error publishing article:', error);
    setErrorMessage(t('publish.failed'));
  }
};

   

if (loading) {
  return <Loader />;
}


  return (
    <div className="publish-page">
      <NavbarWithNotification />
      <Container className="pt-5 pb-5">
        <form onSubmit={handleSubmit} className="article-form w-100 " encType="multipart/form-data">
          <Row className="w-75 align-items-center mb-3">
            <Col lg={8} md={8}>
              <div className="d-flex justify-content-start">
                <div
                  className="editor-toolbar text-black rounded-pill d-inline-flex flex-wrap gap-1 align-items-center p-2 mb-3"

                  style={{
                    backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                    color: isDarkMode ? '#f1f1f1' : '#000',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    borderRadius: '20px',
                    maxWidth: '100%',
                  }}
                >
                  <select
                    onChange={(e) => {
                          const tag = e.target.value;
    setSelectedStyle(tag);
    applyTagToSelection(tag);
                    }}
                    
                    value={selectedStyle}
                    className="form-select form-select-sm me-2"
                    style={{ width: '100px', border: 'none',outline:'none',boxShadow:"none",
                            backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                            color: isDarkMode ? '#f1f1f1' : '#000', }}
                    aria-label="Select block style"
                  >
                    <option value="p">Style</option>
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                  </select>

                  <button
                    type="button"
                    className={`btn btn-sm ${activeFormats.includes('bold') ? 'btn-active'  : 'btn-outline-dark'}`}
                    onClick={() => handleToolbarAction('bold')}
                    style={{ backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                            color: isDarkMode ? '#f1f1f1' : '#000',}} 
                    aria-label="Bold"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeFormats.includes('italic') ? 'btn-active' : 'btn-outline-dark'}`}
                    onClick={() => handleToolbarAction('italic')}
                    style={{ backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                            color: isDarkMode ? '#f1f1f1' : '#000',}}
                    aria-label="Italic"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-2 ${
                      activeFormats.includes('insertUnorderedList') ? 'btn-active' : 'btn-outline-dark'
                    }`}
                    onClick={() => handleToolbarAction('insertUnorderedList')}
                    style={{ backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                            color: isDarkMode ? '#f1f1f1' : '#000',}}
                    aria-label="Unordered List"
                    title="Unordered List"
                  >
                    <i className="fas fa-list-ul"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-2 ${
                      activeFormats.includes('insertOrderedList') ? 'btn-active' : 'btn-outline-dark'
                    }`}
                    style={{ backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                            color: isDarkMode ? '#f1f1f1' : '#000',}}
                    onClick={() => handleToolbarAction('insertOrderedList')}
                    aria-label="Ordered List"
                    title="Ordered List"
                  >
                    <i className="fas fa-list-ol"></i>
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => handleToolbarAction('insertHorizontalRule')}
                    style={{ backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                            color: isDarkMode ? '#f1f1f1' : '#000',}}
                    aria-label="Insert Horizontal Rule"
                    title="Insert Horizontal Rule"
                  >
                    —
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => handleToolbarAction('createLink')}
                    style={{ backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                            color: isDarkMode ? '#f1f1f1' : '#000',}}
                    aria-label="Insert Link"
                    title="Insert Link"
                  >
                    🔗
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => handleToolbarAction('formatBlock', 'blockquote')}
                    style={{ backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                            color: isDarkMode ? '#f1f1f1' : '#000',}}
                    aria-label="Blockquote"
                    title="Blockquote"
                  >
                    &quot;
                  </button>
                </div>
              </div>
            </Col>
            <Col lg={4} md={4} className="d-flex justify-content-end">
              <button type="submit" className="btn main-btn rounded-pill">
                {t("publish.postButton")}
              </button>
            </Col>
          </Row>


          
                    <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className='w-75 shadow-sm'
            
            style={{
              borderRadius: '5px',
              height: image ? 'auto' : '300px',
              display: 'flex',
              flexDirection:'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
              color: isDarkMode ? '#f1f1f1' : '#000',
              textAlign: 'center',
              marginTop: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {image ? (
              <>
                <img
                  src={image}
                  alt="uploaded"
                  onLoad={(e) => {
                    const container = e.target.parentElement;
                    const img = e.target;
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    container.style.height = `${container.clientWidth / aspectRatio}px`;
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.3s ease',
                  }}
                />
                <div className="d-flex gap-2 position-absolute top-0 end-0 m-2" style={{ zIndex: 2 }}>
                  <button type="button" className="btn btn-light btn-sm" onClick={handleUploadNewImage}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => {
                    setImage(null);
                    setArticle(prev => ({ ...prev, image: null }));
                  }}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </>
            ) : (
              <>
                <i className="fas fa-image" style={{ fontSize: '4rem', color: '#aaa', marginBottom: '0.5rem' }}></i>
                <button type="button" className="btn btn-outline-dark mt-2" onClick={handleUploadNewImage}>
                  {t("publish.uploadImage")}
                </button>
              </>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImage} ref={fileInputRef} style={{ display: 'none' }} />
          <Container className="mt-4 w-75 text-start">
            <Row className="mb-3">
              <label htmlFor="article-title" className={`form-label ${isRTL ? "text-end" : "text-start"}`}>
                {t("publish.titleLabel")} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control rounded-pill fs-4"
                // placeholder="Title"
                id="article-title"
                name="title"
                value={article.title}
                onChange={handleInputChange}
                required
                style={{backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                        color: isDarkMode ? '#f1f1f1' : '#000',
                        boxShadow:'none',outline:'none'}}
                aria-required="true"
              />
            </Row>
            <Row >
              <label htmlFor="article-content" className={`form-label ${isRTL ? "text-end" : "text-start"}`}>
                {t("publish.contentLabel")} <span className="text-danger">*</span>
              </label>
              <div
                id="article-content"
                className="form-control publish-editor rounded"
                contentEditable
                onInput={onContentInput}
                ref={contentRef}
                suppressContentEditableWarning={true}
                spellCheck={true}
                style={{
                  minHeight: '300px',
                  borderRadius: '5px',
                  overflowY: 'auto',
                  padding: '15px',
                  border: '1px solid #ced4da',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  backgroundColor: isDarkMode ? '	#333333' : '#F1F2F2',
                  color: isDarkMode ? '#f1f1f1' : '#000',
                  boxShadow:'none',
                  outline:'none'
                }}
                aria-multiline="true"
                role="textbox"
                tabIndex={0}
              />
            </Row>
            {errorMessage && (
              <Row className="mt-3">
                <Col>
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                </Col>
              </Row>
            )}
          </Container>
        </form>
      </Container>
      <Footer />
    </div>
  );
}
