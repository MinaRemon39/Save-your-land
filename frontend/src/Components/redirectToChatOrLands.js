export const redirectToChatOrLands = (navigate) => {
    fetch('http://localhost:8000/api/lands/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            navigate('/chat/lands');
        } else {
            navigate('/chat');
        }
    })
    .catch(error => console.error('Error fetching lands:', error));
};