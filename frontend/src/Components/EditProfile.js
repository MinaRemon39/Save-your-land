import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';
import { Nav, Navbar } from 'react-bootstrap';
import { faMoon, faBell } from '@fortawesome/free-regular-svg-icons';
import Image_1 from './Images/photo_2024-10-29_21-03-55.jpg';
import LogoutButton from './LogoutButton';
import { redirectToChatOrLands } from './redirectToChatOrLands';
import Loader from './Loader';
import NavbarWithNotification from './NavbarWithNotification';

export default function EditProfile() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
  
    const token = localStorage.getItem('token');
    const navigate = useNavigate();


    useEffect(() => {
        if (!token) {
            alert("Authentication is required. Please log in.");
            navigate('/login');
            return;
        }

        fetch('http://localhost:8000/api/profile/', {
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                setUsername(data.username || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setBio(data.profile?.bio || '');

                if (data.profile?.profile_pic) {
                    const fullUrl = data.profile.profile_pic.startsWith('http')
                        ? data.profile.profile_pic
                        : `http://localhost:8000${data.profile.profile_pic}`;
                        setPreviewImage(fullUrl);
                } else {
                    setPreviewImage("http://localhost:8000/media/profile_pics/user.png");
                }

                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching profile:', error);
                alert('Failed to load profile information.');
                setLoading(false);
            });
    }, [token, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setProfilePic(file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const [isBellClicked, setIsBellClicked] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const count = localStorage.getItem("unreadNotifications");
        if (count) {
            setUnreadCount(parseInt(count));
        }
    }, []);


    const goToProfile = () => {
        navigate('/profile');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
    
    
        if (!token) {
            alert("Authentication is required. Please log in.");
            navigate('/login');
            return;
        }
    
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('bio', bio);
        if (profilePic) {
            formData.append('profile_pic', profilePic);
        }
    
        fetch('http://localhost:8000/api/edit-profile/', {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
            },
            body: formData,
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const errorValues = Object.values(data).flat().join(' ');
                    setErrorMessage(errorValues || 'Failed to update profile.');
                    return;
                }
    
                if (data.profile && data.profile.profile_pic) {
                    const fullUrl = data.profile.profile_pic.startsWith('http')
                        ? data.profile.profile_pic
                        : `http://localhost:8000${data.profile.profile_pic}`;
                    setPreviewImage(fullUrl);
                }
    
                navigate('/profile');
            })
            .catch(error => {
                console.error('Error:', error);
                setErrorMessage('Error updating profile: ' + error.message);
            });
    };

if (loading) {
  return (
    <div className="articles pt-5 pb-5">
      <Container>
        <Loader />
      </Container>
    </div>
  );
}

    return (
        <div>     
<NavbarWithNotification />
            <Container className="pt-4">
                <form onSubmit={handleSubmit} className="w-100 text-start">
                    <Link to="/profile" className="text-decoration-none text-dark mb-3 d-block">
                        <FontAwesomeIcon icon={faArrowLeft} /> Back to Profile
                    </Link>
                    <div className="row w-100 ">
                        <div className="col-md-8">
                            <h2 className="fw-bold">Edit Profile</h2>
                        </div>
                        {/* Right side image */}
                        <div className="col-md-4 d-flex flex-column align-items-center">
                            <img
                                src={previewImage || "http://localhost:8000/media/profile_pics/user.png"}
                                alt="Profile Preview"
                                className="rounded-circle"
                                style={{ width: '120px', height: '120px', objectFit: 'cover', border: '2px solid #ccc' }}
                            />
                            <div>
                                <label htmlFor="fileInput" style={{ cursor: 'pointer', color: '#555', fontSize: '0.9rem' }}>
                                    change photo
                                </label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="d-none"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row w-100 d-flex">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="mb-2 fw-bold fs-5">Username</label><br />
                                <input                                 type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required className="form-control" />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="mb-2 fw-bold fs-5">Email</label><br />
                                <input                                 type="email"
                                placeholder="Email"
                                value={email}
                                readOnly
                                className="form-control bg-light" />
                            </div>
                        </div>
                    </div>
                    <div className="row w-100 d-flex">
                        <div className="col-lg-12">
                            <div className="mb-3">
                                <label className="mb-2 fw-bold fs-5">Phone</label><br />
                                <input                                 type="text"
                                placeholder="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}required className="form-control" />
                            </div>
                        </div>
                    </div>
                    <div className="row w-100 ">
                        <div className="col-lg-12">
                            <div className="mb-3">
                                <label className="mb-2 fw-bold fs-5">Description</label>
                            <textarea placeholder="Description"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="form-control" rows="4" />
                            </div>
                        </div>
                    </div>

                    <div className="w-100 text-start d-flex align-items-center gap-3 my-4">
                        <button onClick={goToProfile} className="border-1 rounded-pill bg-transparent" style={{ height: "50px", width: "150px" }}>
                            Cancel
                        </button>
                        <button className="btn main-btn rounded-pill" type="submit" style={{ height: "50px" }}>
                            Save
                        </button>
                    </div> 
                    {errorMessage && (
                            <div className="text-danger mb-3">
                                {errorMessage}
                            </div>
                        )}
                </form>
            </Container>
            <Footer />
        </div>
    );
}
