import  Container  from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';
import Navigator from './Navigator'

export default function Done(){
      const { t } = useTranslation();
    function tosignpage(event){
        event.preventDefault();
        window.location.href="/signpage";
    }
    return(
    <div>
        <Navigator />
        <Container className=" py-5 text-center" style={{width: "70vw", margin: "60px auto", borderRadius: "15px",
            boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.3)"
        }}>
                <h1 class="text-center mt-3 mb-5 fw-bold">{t("done.title")}</h1>
                <p className="fs-5 ">{t("done.message")}</p>
                <button className="btn rounded-pill main-btn text-light mt-3 w-25" onClick={tosignpage}>{t("done.loginButton")}</button>
        </Container>
     
    </div>
    );
}
<Done />