import React from 'react';

const Header = () => {
    return (
        <div className="header">
            <div className='navbarItems'>
                <img 
                    style={{ 
                        position: "fixed", 
                        zIndex: 1001 ,
                        left: "0",
                        maxHeight: "15%",
                        width: "auto",
                        top: "1%" 
                        }} 
                    src='./truecaLogo.webp' alt='Logo'
                />
            </div>
        </div>
    );
}

export default Header;