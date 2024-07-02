import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditarRespuesta = () => {
    const [respuesta, setRespuesta] = useState('');
    const [huboCambio, setHuboCambio] = useState(false)
    const [myError, setMyError] = useState(false);
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');

    const handleRespuestaChange = (e) => {setRespuesta(e.target.value); setHuboCambio(true);}

    useEffect(() => {
      const fetchData = async () => {
          const url = `http://localhost:8000/public/updateComentario?${id}`;
          const response = await axios.put(url);
  
          if (response.data.length === 0) {
            setUsuarios([]); 
          } else {
            const comentarioData = procesar(response.data)[0]; // Solo toma el primer comentario
            setComentario([comentarioData]);
            setTexto(comentarioData.texto);
          }
      };
  
      fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
		console.log('Submit button clicked!');
		const formData = new FormData();
		(respuesta)&&formData.append('setrespuesta', respuesta);
		try {
			setMyError(false);
            if (huboCambio === true) {
                if (window.confirm('¿Seguro que deseas modificar la respuesta?')) {
                    const response = await axios.put("http://localhost:8000/public/updateComentario", formData,
                    {
                     headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    console.log('Success:', response);
                    window.location.reload();
                }
            } else {
                alert('No se realizo ningun cambio')
                window.location.reload();
            }
		} catch (error) {
            console.log('entre por error')
			console.error('Error:', error.response.data.Mensaje);
			setMyError(true);
			setMsgError(error.response.data.Mensaje);
		}
    };

    function procesar(comentarios) {
        let comentarioCopy = [];
        Object.keys(comentarios).forEach(function (clave) {
            if (!isNaN(clave)) {
                comentarioCopy[clave] = comentarios[clave]
            }
        })
        console.log(comentarioCopy)
        return comentarioCopy
    }

    return (
        <div id="editarComentario">
            <br/> <br />
            <form onSubmit={handleSubmit}>
                <h3> Modifica tu comentario! </h3>  <br /> <br />
                {comentarios.map(comentario => (
                    <textarea value={respuesta} onChange={handleComentarioChange} maxLength="255" placeholder={comentario.respuesta} required></textarea>       
                ))}
                <ButtonSubmit text="Modificar respuesta" />
            </form>
            {myError &&
               <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
            }
        </div>
	);
};

export default EditarRespuesta;