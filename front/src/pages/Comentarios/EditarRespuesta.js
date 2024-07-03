import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditarRespuesta = ({id}) => {
    const [texto, setTexto] = useState('');
    const [huboCambio, setHuboCambio] = useState(false)
    const [myError, setMyError] = useState(false);
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');


    const handleTextoChange = (e) => {setTexto(e.target.value); setHuboCambio(true);}

    useEffect(() => {
        const fetchData = async () => {
          try {
            const url = `http://localhost:8000/public/listarComentarios?id=${id}`;
            const response = await axios.get(url);
    
            if (response.data.length === 0) {
              setTexto(''); 
            } else {
              const comentarioData = procesar(response.data)[0]; // Solo toma el primer usuario
              setTexto(comentarioData.respuesta);
            }
          } catch  (error) {
            console.error(error);
          }
        };
    
        fetchData();
      }, []);

    const handleSubmit = () => {
        const fetchData = async () => {
          
            const formData = new FormData();
            formData.append('id', id);
            (texto)&&(formData.append('setrespuesta', texto));
    
            try {
                console.log(`texto: ${formData.get('setrespuesta')}`)
                setMyError(false);
                if (huboCambio === true) {
                    if (window.confirm('¿Seguro que deseas modificar los datos?')) {
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
      
          fetchData();
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
                <h3> Modifica tu respuesta! </h3>  <br /> <br />
                    <textarea value={texto} onChange={handleTextoChange} maxLength="255" placeholder={texto} required></textarea>       
                <ButtonSubmit text="Modificar Respuesta" />
            </form>
            {myError &&
               <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
            }
        </div>
	);
};

export default EditarRespuesta;