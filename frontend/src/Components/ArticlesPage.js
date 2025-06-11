import Articles from "./Articles";
import NavbarWithNotification from './NavbarWithNotification';
import Footer from './Footer';

export default function ArticlesPage() {
  return (
    <div>
      <NavbarWithNotification />

      <div className="container" style={{padding: "86px"}}>
        
        <Articles />
      </div>
      <Footer />
    </div>
    );
}