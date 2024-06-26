import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../HarryStyles/Notificaciones.css';
import '../HarryStyles/NavBar.css';
import { ButtonCerrarSesion } from './ButttonCerrarSesion';
import { CiBellOn } from "react-icons/ci";
import ListarNotis from '../pages/Notificaciones/ListarNotis';

export function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [notiOpen, setNotiOpen] = useState(false);
    const [token, setToken] = useState(null);

    const toggleMenu = () => {
        setMenuOpen(prevState => !prevState);
    };

    const toggleNotificaciones = () => {
        setNotiOpen(prevState => !prevState);
    };

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        setToken(savedToken);
    }, []);

    return (
        <div className='navbar'>
            <div className='navbarItems'>
                <li className='buttonNavBar'>
                    <Link to="/" className="botonNavBar">Inicio</Link>
                </li>
                <li className='buttonNavBar'>
                    <Link to="/Explorar" className="botonNavBar">Explorar</Link>
                </li>
                {token === 'tokenUser' && (
                    <>
                        <li className='buttonNavBar'>
                            <Link to="/agregarPublicacion" className="botonNavBar">Subir Publicación</Link>
                        </li>
                        <li className='buttonNavBar'>
                            <Link to="/Intercambios" className="botonNavBar">Mis Intercambios</Link>
                        </li>
                    </>
                )}
                {token === 'tokenAdmin' && (
                    <>
                        <li className='buttonNavBar'>
                            <Link to="/Categorias" className="botonNavBar">Categorías</Link>
                        </li>
                        <li className='buttonNavBar'>
                            <Link to="/Usuarios" className="botonNavBar">Usuarios</Link>
                        </li>
                        <li className='buttonNavBar'>
                            <Link to="/Estadisticas" className="botonNavBar">Estadisticas</Link>
                        </li>
                    </>
                )}
                {token === 'tokenVolunt' && (
                    <li className='buttonNavBar'>
                        <Link to="/Intercambios" className="botonNavBar">Intercambios</Link>
                    </li>
                )}
                <li className='buttonNavBar'>
                    <Link to="/Centros" className="botonNavBar">Centros</Link>
                </li>
                <li className='buttonNavBar'>
                    <a href="https://caritas.org.ar/quienes-somos/" className="botonNavBar">¿Quiénes somos?</a>
                </li>
                {token === null ? (
                    <li className='buttonNavBar'>
                        <Link to="/IniciarSesion" className="botonNavBar">Iniciar Sesión</Link>
                    </li>
                ) : (
                <>
                    <li className='notiIcon'>
                        <button onClick={toggleNotificaciones} className='botonCampanita'>
                            <CiBellOn size={32} className='botonCampanita'/>
                        </button>
                        {notiOpen && (
                            <div className={`dropdownmenuNoti ${notiOpen ? 'showNoti' : ''}`}>
                                <ListarNotis />
                            </div>
                        )}
                    </li>
                    <li className='buttonNavBar'>
                        <button className="botonNavBar" onClick={toggleMenu}>Menú</button>
                    </li>
                </>
                    )}
                    {menuOpen && (
                        <div className={`dropdownmenu ${menuOpen ? 'show' : ''}`}>
                            <ul>
                                <li className='saludoUsuario'>¡Hola {localStorage.getItem('username')}!</li>
                                <li><Link to={`/PubliUsuario/${localStorage.getItem('username')}`}><button className='opButton' onClick={toggleMenu}>Ver mi Perfil</button></Link></li>
                                <li><Link to="/config"><button className='opButton' onClick={toggleMenu}>Configuraciones</button></Link></li>
                                {token === 'tokenUser' && (
                                <>
                                    <li className='buttonNavBar'>
                                            <Link to="/MisPublicaciones"><button className='opButton'onClick={toggleMenu}>Mis Publicaciones</button></Link>
                                    </li>
                                </>
                                )}
                                <li><ButtonCerrarSesion /></li>
                            </ul>
                        </div>
                    )}
            </div>
        </div>
    );
}
export default NavBar;
