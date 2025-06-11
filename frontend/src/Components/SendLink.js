import  Container  from 'react-bootstrap/Container';
export default function SendLink(){
    function toUpdate(event){
        event.preventDefault();
        window.location.href="/update";
    }
    return(
        <Container className="bg-white py-5" style={{width: "70vw", margin: "60px auto", borderRadius: "15px",
            boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.3)"
        }}>
            <h1 className="text-center mt-3 mb-5 fw-bold">Forgot Password</h1>
            <p className="fs-5 text-black text-center">someone has requested a password reset for the following account.<br />
                Username: Example@gmail.com<br />
                if this was a mistake. just ignore this email and nothing will happen to reset your password,<br />
                 click the button below</p>
            <div className="w-100 text-center">
                <button onClick={toUpdate} className="btn rounded-pill main-btn text-light mx-auto text-center" >Reset password</button>
            </div>
        </Container>
    );
}
<SendLink />