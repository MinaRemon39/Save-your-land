import { useState, useRef, useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image_1 from './Images/photo_2024-10-29_21-03-55.jpg';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import NavbarWithNotification from './NavbarWithNotification';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';

export default function ChatBot() {
      const { t, i18n } = useTranslation();
    const token = localStorage.getItem('token');
    const location = useLocation();
    const land = location.state?.land;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [userData, setUserData] = useState(null);
    const [subscriptionActive, setSubscriptionActive] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        inputRef.current.style.height = 'auto';  
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px'; 
    };

    const navigate = useNavigate();

useEffect(() => {
    if (token) {
        fetch('http://localhost:8000/api/profile/', {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setUserData(data);
            fetch('http://127.0.0.1:8000/api/subscription/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(subData => {
                setSubscriptionActive(subData.ai_assistant === true);
                setSubscriptionLoading(false);
            })
            .catch(() => {
                setSubscriptionActive(false);
                setSubscriptionLoading(false);
            });
        })
        .catch(err => {
            console.error('Error fetching user data:', err);
            setSubscriptionLoading(false);
        });
    }
}, [token]);


if (!userData || subscriptionLoading) {
    return <Loader />;
}


    const sendMessage = async () => {
        if (!input.trim()) {
            alert("Please enter a valid message");
            return;
        }
    
        setMessages(prev => [...prev, { from: "user", text: input }]);
        setInput("");
        setLoading(true);
    
        if (!token) {
            setMessages(prev => [...prev, { from: "bot", text: "No token found, please log in again." }]);
            setLoading(false);
            return;
        }
    
const user_id = userData?.id;
const land_id = land?.id;

if (!user_id || !land_id) {
    setMessages(prev => [...prev, { from: "bot", text: "User ID or Land ID is missing." }]);
    setLoading(false);
    return;
}

try {
    const response = await fetch(`http://localhost:8001/start-chat/${user_id}/${land_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
                    body: JSON.stringify({
        user_input: input
    })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setMessages(prev => [...prev, { from: "bot", text: data.Response }]);
            } else {
                setMessages(prev => [...prev, { from: "bot", text: "Error: Unable to contact server." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { from: "bot", text: "Error: Unable to contact server." }]);
        }
        setLoading(false);
    };

if (!userData || subscriptionLoading) {
    return <Loader />;
}

const isAdmin = userData?.user_type === 'administrator';  

if (!subscriptionActive && !isAdmin) {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavbarWithNotification />
            <div style={{ flex: 1, padding: 20, textAlign: 'center' }}>
                <h2>{t('chat.subscriptionRequired')}</h2>
                <button
                    className='btn main-btn rounded-pill'
                    onClick={() => navigate('/shop')}
                    style={{ padding: '10px 20px', marginTop: 20, cursor: 'pointer' }}
                >
                    {t('chat.subscribeNow')}
                </button>
            </div>
        </div>
    );
}
    const userLands = JSON.parse(localStorage.getItem("lands")) || [];

    const handleChatClick = () => {
        if (userLands.length > 0) {
            navigate('/chat/lands');
        } else {
            navigate('/chat');
        }
    };

    return (
        <div className="chatbot-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavbarWithNotification />
            <div className="chat-container" style={{ flex: 1, overflowY: 'auto', padding: '20px', position: 'relative' }}>
                {messages.map((msg, i) => (
                    <div key={i} className={`message-row ${msg.from}`} style={{
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '5px',   
    justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start'  
}}>
                        {msg.from === "bot" && (
                            <img
                                src={Image_1}
                                alt="Bot"
                                className="bot-avatar"
                                style={{ width: '35px', height: '35px', borderRadius: '50%', marginRight: '10px' }}
                            />
                        )}
<div
    className={`message ${msg.from}`}
    style={{
        backgroundColor: msg.from === "bot" ? "#f1f1f1" : "#d1e7dd",
        padding: '10px 15px',
        borderRadius: '20px',
        maxWidth: '70%',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap',
        direction: 'rtl',
        textAlign: 'right',
        marginLeft: msg.from === "user" ? 'auto' : '0',
        marginRight: msg.from === "bot" ? 'auto' : '0'
    }}
>

                            <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message-row bot" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <img
                            src={Image_1}
                            alt="Bot"
                            className="bot-avatar"
                            style={{ width: '35px', height: '35px', borderRadius: '50%', marginRight: '10px' }}
                        />
                        <div className="dot-loader" style={{
                            width: '40px',
                            padding: '5px 10px',
                            borderRadius: '15px',
                            backgroundColor: '#f1f1f1',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}></div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input" style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'white',
                padding: '15px',
                borderTop: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <textarea
                    ref={inputRef}
                    placeholder="Message"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    rows={1}
                    style={{
                        flex: 1,
                        maxWidth: '600px',
                        padding: '10px 15px',
                        borderRadius: '30px',
                        border: '1px solid #ccc',
                        outline: 'none',
                        resize: 'none',
                        overflow: 'hidden',
                        direction: 'rtl',
                        textAlign: 'right'
                    }}
                    disabled={loading}
                />
                <button onClick={sendMessage} className="send-button" disabled={loading}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
        </div>
    );
}