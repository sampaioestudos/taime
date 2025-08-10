import React from 'react';

const Footer: React.FC = () => {
    // Applying a radical, literal implementation for debugging purposes as per user instruction.
    return (
        <footer style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50px',
            backgroundColor: 'red',
            zIndex: 9999,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold'
        }}>
            Conteúdo do Rodapé
        </footer>
    );
};

export default Footer;