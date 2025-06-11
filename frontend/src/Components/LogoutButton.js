import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const logoutbtn = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8000/api/logout/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                localStorage.removeItem('token'); 
                navigate('/'); 
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <button onClick={logoutbtn} className="btn main-btn rounded-pill">
            {t("navbar.logout")}
        </button>
    );
};

export default LogoutButton;