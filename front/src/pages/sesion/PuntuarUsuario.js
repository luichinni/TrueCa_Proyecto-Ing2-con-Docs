import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import ReactStars from 'react-rating-stars-component';
import { ButtonSubmit } from "../../components/ButtonSubmit";

const PuntuarUsuario = () => {
  const navigate = useNavigate(); 
  const [puntuacion, setPuntuacion] = useState(0);
  const [myError, setMyError] = useState(false);
  const Token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const { publicacionOferta, publicacionOfertada, publicacion } = useParams();
  const [userOferto, setUserOferto] = useState('');
  const [userPubli, setUserPubli] = useState('');
  const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');
  const [userValorado, setUserValorado] = useState('');

  const handlePuntuacionChange = (newRating) => setPuntuacion(newRating); // Multiplicar por 2 para obtener valores en incrementos de 2

  // Actualiza userValorado cuando userOferto o userPubli cambian
  useEffect(() => {
    if (userOferto && userPubli) {
      const valorado = (username === userOferto) ? userPubli : userOferto;
      setUserValorado(valorado);
    }
  }, [userOferto, userPubli, username]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url1 = `http://localhost:8000/public/listarPublicaciones?id=${publicacionOferta}&token=${Token}`;
        const response1 = await axios.get(url1);

        if (response1.data) {
          let publicaciones = procesar(response1.data);
          let userPub = publicaciones[0]?.user || 'nop';
          setUserPubli(userPub);
        } else {
          setUserPubli('nop');
        }
      } catch (error) {
        console.error(error);
      }

      try {
        const url2 = `http://localhost:8000/public/listarPublicaciones?id=${publicacionOfertada}&token=${Token}`;
        const response2 = await axios.get(url2);

        if (response2.data) {
          let publicaciones = procesar(response2.data);
          let userOfer = publicaciones[0]?.user || 'nop';
          setUserOferto(userOfer);
        } else {
          setUserOferto('nop');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [publicacionOferta, publicacionOfertada, Token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(`puntos ${puntuacion}`)
    const formData = new FormData();
    formData.append('userValorado', userValorado);
    formData.append('userValorador', username);
    formData.append('intercambio', publicacion)
    formData.append('puntos', puntuacion);

    try {
      setMyError(false);
      const response = await axios.post("http://localhost:8000/public/newValoracion", formData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log('Success:', response);
      navigate("/Intercambios");
    } catch (error) {
      console.error('Error:', error.response.data.Mensaje);
      setMyError(true);
      setMsgError(error.response.data.Mensaje);
    }
  };

  function procesar(publicaciones) {
    return Object.keys(publicaciones).map(clave => {
      if (!isNaN(clave)) {
        return publicaciones[clave];
      }
      return null;
    }).filter(item => item !== null);
  }

  return (
    <>
      <h1>Trueca </h1>
      <div id="puntuar">
        <br />
        <form onSubmit={handleSubmit}>
          <h3> Puntua a {userValorado} por el intercambio que realizaste! </h3>  <br /> <br />
          <ReactStars
            count={5}
            onChange={handlePuntuacionChange}
            size={64}
            activeColor="#ffd700"
            isHalf={true} // Permite puntuaciones medias
          />
          <ButtonSubmit text='Puntuar Usuario' />
        </form>
        {myError &&
          <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
        }
      </div>
    </>
  );
};

export default PuntuarUsuario;
