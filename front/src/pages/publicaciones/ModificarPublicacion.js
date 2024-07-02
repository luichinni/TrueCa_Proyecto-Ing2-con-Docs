import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "../../HarryStyles/Intercambios.css"
import "../../HarryStyles/estilos.css";

const ModificarPublicacion = () => {
	const navigate = useNavigate(); 
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [centros, setCentros] = useState('');

    const [huboCambio, setHuboCambio] = useState(false)
    const [myError, setMyError] = useState(false);
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');

    const handleNombreChange = (e) => {setNombre(e.target.value); setHuboCambio(true);}
    const handleDescripcionChange = (e) => {setDescripcion(e.target.value); setHuboCambio(true);}
    const handleCentrosChange = (e) => {setCentros(e.target.value); setHuboCambio(true);}

    useEffect(() => {
      const fetchData = async () => {
  
        try {
          const url = `http://localhost:8000/public/listarPublicacion?`; //Falta agregar el id de la publicación que queres traer!!! 
          const response = await axios.get(url);
  
          if (response.data.length === 0) {
           // setUsuario([]); 
          } else {
            const usuarioData = procesar(response.data)[0]; // Solo toma la primera publicacion
           // setUsuario([usuarioData]);
            setNombre(usuarioData.nombre);
            setDescripcion(usuarioData.descripcion);
            setCentros(usuarioData.centro);
          }
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchData();
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
		  console.log('Submit button clicked!');

		
			console.log('entro');
			const formData = new FormData();
		//	formData.append('username', username);
      (nombre)&&(formData.append('setnombre', nombre));
			(descripcion)&&formData.append('setdescripcion', descripcion);
			(centros)&&formData.append('setdni', centros);

			try {
				setMyError(false);
                console.log(`nombre: ${formData.get('setnombre')}`);
                console.log(`descripcion: ${formData.get('setadescripcion')}`);

        if (huboCambio === true) {
          if (window.confirm('¿Seguro que deseas modificar los datos?')) {
          const response = await axios.put("http://localhost:8000/public/updateUsuario", formData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            });
          console.log('Success:', response);
          navigate("/");
          }
        } else {
          alert('No se realizo ningun cambio')
          navigate("/");
        }
			} catch (error) {
        console.log('entre por error')
				console.error('Error:', error.response.data.Mensaje);
				setMyError(true);
				setMsgError(error.response.data.Mensaje);
			}
    };
    function procesar(publicacion) {
      let publicacionCopy = [];
      Object.keys(publicacion).forEach(function (clave) {
        if (!isNaN(clave)) {
          publicacionCopy[clave] = publicacion[clave]
        }
      })
      console.log(publicacionCopy)
      return publicacionCopy
    }

    function procesarcen(centros) {
      let cenCopy = [];
      Object.keys(centros).forEach(function (clave) {
          if (!isNaN(clave)) {
              cenCopy[clave] = centros[clave]
          }
      })
      return cenCopy
    }

    useEffect(() => {
      const fetchData = async () => {
          try {
              const res = await axios.get(`http://localhost:8000/public/listarCentros?id=&nombre=&direccion=&hora_abre=&hora_cierra=`);
              setCentros(procesarcen(res.data));
          } catch (error) {
              console.error(error);
          }
      };
      fetchData();
  }, []);

    return (
        <div>
            <br /><br /><br /><br /><br /><br />
            <form onSubmit={handleSubmit}>
                <input type="text" value={nombre} onChange={handleNombreChange} placeholder="Nombre del producto" required />
                <br /><br />
                <textarea value={descripcion} onChange={handleDescripcionChange} maxLength="255" placeholder="Descripción del producto (Máximo 255 caracteres)" required></textarea>
                <br /><br />
                <label>
                    Seleccione las fotos que queres agregar:
                    //Hacer algo para que pueda agregar fotos.
                </label>
                <label>
                    Seleccione las fotos a eliminar:
                    //Aca hay que hacer algo para poder eliminar fotos
                </label>
                <br /><br />
                <select id="centro" onChange={handleCentrosChange} multiple>
                    <option value="">Seleccione un centro</option>
                    {centros.map((centro) => (
                        <option key={centro.id} value={centro.id}>
                            {centro.nombre}
                        </option>
                    ))}
                </select>
                <br /> <br/>
                <ButtonSubmit text="Editar producto!" />
            </form>
            {myError &&
                <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
            }
        </div>
    );
};

export default ModificarPublicacion;

