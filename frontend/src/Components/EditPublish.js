import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarWithNotification from './NavbarWithNotification';
import Footer from './Footer'
import Loader from './Loader';
import { useTranslation } from 'react-i18next';


export default function EditPublish() {
    const { t, i18n } = useTranslation();
      const isRTL = i18n.language === 'ar';
  const { articleId } = useParams();
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('user_type');
  const navigate = useNavigate();

  const [article, setArticle] = useState({ title: '', content: '', image: null });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  const [selectedStyle, setSelectedStyle] = useState("p");
  const [activeFormats, setActiveFormats] = useState([]);
  const updateFormatsTimeout = useRef(null);

useEffect(() => {
  if (userType !== 'publisher' && userType !== "administrator") {
    alert(t('editPublish.accessDenied'));
    navigate('/articlespage');
  }
}, [navigate]);

useEffect(() => {
  fetch(`http://localhost:8000/api/articles/${articleId}/`, {
    headers: { Authorization: `Token ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.image) {
        const img = new Image();
        img.src = data.image;
        img.onload = () => setImage(data.image);
        img.onerror = () => setImage(null); 
      } else {
        setImage(null);
      }
      setArticle({ title: data.title, content: data.content, image: data.image });
    })
    .catch((error) => console.error(t('editPublish.fetchError'), error))
    .finally(() => setLoading(false));
}, [articleId])


useEffect(() => {
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const parentBlock = selection.getRangeAt(0).startContainer.parentNode;
    if (!parentBlock) return;

    const tagName = parentBlock.tagName?.toLowerCase();
    if (tagName === 'h1' || tagName === 'h2') {
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

const extractTextFromHtml = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};


const countWords = (htmlContent) => {
  const text = extractTextFromHtml(htmlContent);
  return (text.match(/[\p{L}\p{N}_]+/gu) || []).length;
};

const updateActiveFormats = () => {
  const newFormats = [];
  const selection = window.getSelection();
  
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;
    
  
    if (document.queryCommandState('bold')) newFormats.push('bold');
    if (document.queryCommandState('italic')) newFormats.push('italic');
    
    
    if (parentElement.tagName === 'H1') newFormats.push('h1');
    if (parentElement.tagName === 'H2') newFormats.push('h2');
    
   
    if (parentElement.tagName === 'UL' || parentElement.parentElement.tagName === 'UL') {
      newFormats.push('insertUnorderedList');
    }
    if (parentElement.tagName === 'OL' || parentElement.parentElement.tagName === 'OL') {
      newFormats.push('insertOrderedList');
    }
  }
  
  setActiveFormats(newFormats);
};

const onContentInput = (e) => {
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


const handleToolbarAction = (action, value = null) => {
  if (!contentRef.current) return;
  const selection = window.getSelection();
  contentRef.current.focus();

  if (action === 'formatBlock' && value) {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const tag = document.createElement(value);
    tag.textContent = selectedText;
    range.deleteContents();
    range.insertNode(tag);
    range.setStartAfter(tag);
    selection.removeAllRanges();
    selection.addRange(range);
    setSelectedStyle(value);
  } else if (action === 'createLink') {
    const url = prompt('Enter a valid URL (including http:// or https://)');
    if (url && selection && selection.toString()) {
      document.execCommand('createLink', false, url);
    }
  } else if (action === 'removeFormat') {
    document.execCommand('removeFormat', false, null);
  } else {
    document.execCommand(action, false, value);
  }

  setTimeout(() => {
    setArticle(prev => ({
      ...prev,
      content: contentRef.current.innerHTML,
    }));
  }, 50);
};

 const handleDeleteImage = async () => {
  setImage(null);
  setArticle(prev => ({ ...prev, image: null }));


  const formData = new FormData();
  formData.append('title', article.title);
  formData.append('content', article.content || '');
  formData.append('image', '');

  try {
    const response = await fetch(`http://localhost:8000/api/articles/${articleId}/`, {
      method: 'PUT',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      console.error(t('editPublish.deleteImageError'));

    }
  } catch (err) {
    console.error(t('editPublish.deleteImageError'), err);

  }
};

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArticle({ ...article, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadNewImage = () => fileInputRef.current.click();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImage({ target: { files: [file] } });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArticle({ ...article, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setUpdating(true);
  setErrorMessage('');

 
  const wordCount = countWords(article.content);

  if (!article.title || !article.content || article.content === '<p><br></p>') {
    setErrorMessage(t('editPublish.fillAllFields'));
    setUpdating(false);
    return;
  }

  if (wordCount < 100 || wordCount > 1000) {
    setErrorMessage(t('editPublish.wordCountError', { count: wordCount }));
    setUpdating(false);
    return;
  }

  const formData = new FormData();
  formData.append('title', article.title);
  formData.append('content', article.content);
  if (article.image && article.image instanceof File) {
    formData.append('image', article.image);
  } else if (article.image === null) {
    formData.append('image', '');
  }

  try {
    const response = await fetch(`http://localhost:8000/api/articles/${articleId}/`, {
      method: 'PUT',
      headers: { Authorization: `Token ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      setErrorMessage(Object.values(data).flat().join(' ') || t('editPublish.updateFailed'));
      setUpdating(false);
      return;
    }

    alert(t('editPublish.updateSuccess'));
    setUpdating(false);
    navigate('/articlespage');
  } catch (error) {
    console.error('Error:', error);
   setErrorMessage(t('editPublish.updateFailed'));
    setUpdating(false);
  }
};

const initializeEditorContent = useCallback(() => {
  if (contentRef.current && article.content) {
 
    contentRef.current.innerHTML = article.content;

    const elements = contentRef.current.querySelectorAll('*');
    elements.forEach(el => {
      el.setAttribute('contenteditable', 'true');
    });
  }
}, [article.content]);

useEffect(() => {
  initializeEditorContent();
}, [initializeEditorContent]);
return (
  <div className="publish-page">
    <NavbarWithNotification />
    <Container className="pt-5 pb-5">
      {loading ? (
        <div className="text-center my-5"><Loader /></div>
      ) : (
        <form onSubmit={handleSubmit} className="article-form w-100" encType="multipart/form-data">
          <Row className="w-75 align-items-center mb-3">
            <Col lg={8} md={8}>
              <div className="d-flex justify-content-start">
                <div
                  className="editor-toolbar rounded-pill d-inline-flex flex-wrap gap-1 align-items-center p-2 mb-3"
                  style={{
                    backgroundColor: "#F1F2F2",
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    borderRadius: '20px',
                    maxWidth: '100%',
                  }}
                >
                  <select
                    onChange={(e) => {
                      setSelectedStyle(e.target.value);
                      handleToolbarAction('formatBlock', e.target.value);
                    }}
                    value={selectedStyle}
                    className="form-select form-select-sm me-2"
                    style={{ width: '100px', border: "none", backgroundColor: "#F1F2F2" }}
                  >
                    <option value="p">Style</option>
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                  </select>

                  <button type="button" style={{ color: 'black'}} className={`btn btn-sm ${activeFormats.includes('bold') ? 'btn-active' : 'btn-outline-dark'}`} onClick={() => handleToolbarAction('bold')}>B</button>
                  <button type="button" style={{ color: 'black'}} className={`btn btn-sm ${activeFormats.includes('italic') ? 'btn-active' : 'btn-outline-dark'}`} onClick={() => handleToolbarAction('italic')}>I</button>
                  <button type="button" style={{ color: 'black'}} className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-2 ${activeFormats.includes('insertUnorderedList') ? 'btn-active' : 'btn-outline-dark'}`} onClick={() => handleToolbarAction('insertUnorderedList')}><i className="fas fa-list-ul"></i></button>
                  <button type="button" style={{ color: 'black'}} className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-2 ${activeFormats.includes('insertOrderedList') ? 'btn-active' : 'btn-outline-dark'}`} onClick={() => handleToolbarAction('insertOrderedList')}><i className="fas fa-list-ol"></i></button>
                  <button type="button" style={{ color: 'black'}} className="btn btn-sm btn-outline-dark" onClick={() => handleToolbarAction('insertHorizontalRule')}>—</button>
                  <button type="button" style={{ color: 'black'}} className="btn btn-sm btn-outline-dark" onClick={() => handleToolbarAction('createLink')}>🔗</button>
                  <button type="button" style={{ color: 'black'}} className="btn btn-sm btn-outline-dark" onClick={() => handleToolbarAction('formatBlock', 'blockquote')}>&quot;</button>
                </div>
              </div>
            </Col>
            <Col lg={4} md={4} className="d-flex justify-content-end">
              <button type="submit" className="btn main-btn rounded-pill">
                {updating ? t("publish.updatingButton") : t("publish.updateButton")}
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: "#F1F2F2",
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
                  <button type="button" className="btn btn-light btn-sm" onClick={handleDeleteImage}>
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
                {t("publish.titleLabel")}<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control rounded-pill fs-4"
                id="article-title"
                name="title"
                value={article.title}
                onChange={handleInputChange}
                required
                aria-required="true"
              />
            </Row>
            <Row>
              <label htmlFor="article-content" className={`form-label ${isRTL ? "text-end" : "text-start"}`}>
                {t("publish.contentLabel")} <span className="text-danger">*</span>
              </label>
<div
  id="article-content"
  className="form-control publish-editor rounded"
  contentEditable
  onInput={(e) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const caretOffset = range.startOffset;
    
    setArticle({...article, content: e.currentTarget.innerHTML});
    updateActiveFormats();
    

    setTimeout(() => {
      if (selection.rangeCount > 0) {
        const newRange = document.createRange();
        const textNode = contentRef.current.childNodes[0] || contentRef.current;
        newRange.setStart(textNode, Math.min(caretOffset, textNode.length || 0));
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }, 0);
  }}
  ref={contentRef}
  suppressContentEditableWarning={true}
  spellCheck={true}
  dir="auto" 
  style={{
    minHeight: '300px',
    borderRadius: '5px',
    overflowY: 'auto',
    padding: '15px',
    border: '1px solid #ced4da',
    fontFamily: 'inherit',
    fontSize: '1rem',
    backgroundColor: 'white',
    outline: 'none',
    textAlign: 'start' 
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
      )}
    </Container>
    <Footer />
  </div>
);
}