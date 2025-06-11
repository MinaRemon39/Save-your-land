import  {Navbar, Container, Nav, NavLink} from 'react-bootstrap';

const Header = () => {
  const menuData = [
    {
      path: '/',
      name: "Home"
    },
    {
      path: '/',
      name: "About"
    }
  ];
  return(
    <Navbar className='navbar' expand='lg'>
      <Container>
        <Navbar.Brand href="#home">
          <img src="./photo_2024-10-29_21-03-55.jpg" 
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="React Bootstrap logo"/>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav' />
        <Nav className='ms-auto'>
          {
            menuData.map((item)=>(
              <NavLink to={item.path} key={item.name}>
                <div className='list-item'>{item.name}</div>
              </NavLink>
            ))
          }
        </Nav>
        <Nav className='ms-auto'>
          <button className='btn btn-success'>Login</button>
        </Nav>
      </Container>
    </Navbar>
  );
};
export default Header;