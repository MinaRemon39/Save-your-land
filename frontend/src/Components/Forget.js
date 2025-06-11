import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import Navigator from './Navigator'

export default function Forget() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const toSendLink = async (event) => {
        event.preventDefault();

        if (!email) {
            setMessage(t('forgetPassword.missingEmail'));
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/forgot-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(t('forgetPassword.successSent'));
                setSubmitted(true); 
            } else {
                setMessage(data.error || t('forgetPassword.error'));
            }
        } catch (error) {
            setMessage(t('forgetPassword.serverError'));
        }
    }

    if (submitted) {
        return (
       
            <div>
                <Navigator />
            
       
                <Container className=" py-5 text-center" style={{
                borderRadius: "15px",
                boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.3), 0px 6px 20px 0px rgba(0, 0, 0, 0.3)",
                margin: "60px auto",
                width: "60vw"
                }}>
                <h2 className="text-success fw-bold mb-4">{t('forgetPassword.successTitle')}</h2>
                <p className="fs-5">{t('forgetPassword.successMessage')}</p>
                </Container>
            </div>
        );
    }

    return (
    <div>
        <Navigator />
        <Container className=" py-5" style={{
            borderRadius: "15px",
            boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.3), 0px 6px 20px 0px rgba(0, 0, 0, 0.3)",
            margin: "60px auto",
            width: "70vw"
        }}>
            <h1 className="text-center mt-3 mb-5 fw-bold">{t('forgetPassword.title')}</h1>
            <p className="fs-5  text-center">{t('forgetPassword.instruction')}</p>
            <div className="content mx-auto d-flex flex-column justify-content-center align-items-center">
                <p className="fs-5  mt-5">{t('forgetPassword.emailLabel')}</p>
                <div className="input-field mb-5 w-75">
                    <i className="fas fa-envelope ms-3 text-black-50"></i>
                    <input
                        type="email"
                        placeholder={t('forgetPassword.placeholder')}
                        value={email}
                        onChange={handleEmailChange}
                        required
                    />
                </div>
                <button className="btn rounded-pill main-btn text-light" onClick={toSendLink}>{t('forgetPassword.sendLink')}</button>

                {/* Display message */}
                {message && <p className="text-center mt-3">{message}</p>}
            </div>
        </Container>
      
    </div>
        
    );
}