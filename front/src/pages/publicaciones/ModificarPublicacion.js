import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import "../../HarryStyles/Intercambios.css"
import "../../HarryStyles/estilos.css";

const ModificarPublicacion = () => {
	const navigate = useNavigate(); 
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [mail, setEmail] = useState('');
    const [mailViejo, setEmailViejo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [huboCambio, setHuboCambio] = useState(false)
    const [myError, setMyError] = useState(false);
    const username = localStorage.getItem('username')
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');

    const handleNombreChange = (e) => {setNombre(e.target.value); setHuboCambio(true);}
    const handleDescripcionChange = (e) => {setDescripcion(e.target.value); setHuboCambio(true);}
    const handleNumeroDocumentoChange = (e) => {setNumeroDocumento(e.target.value); setHuboCambio(true);}
    const handleMailChange = (e) => {setEmail(e.target.value); setHuboCambio(true);}
    const handleTelefonoChange = (e) => {setTelefono(e.target.value); setHuboCambio(true);}

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        setError('');
  
        try {
          const url = `http://localhost:8000/public/listarPublicacion?${id}`;
          const response = await axios.get(url);
  
          if (response.data.length === 0) {
            setError('No hay publicación disponible');
            setUsuarios([]); 
          } else {
            const usuarioData = procesar(response.data)[0]; // Solo toma la primera publicacion
            setUsuarios([usuarioData]);
            setNombre(usuarioData.nombre);
            setDescripcion(usuarioData.descripcion);
            setNumeroDocumento(usuarioData.dni);
            setEmailViejo(usuarioData.mail);
            setEmail(usuarioData.mail)
            setTelefono(usuarioData.telefono);
            setNewUsername(username);
          }
        } catch (error) {
          setError('Ocurrió un error al obtener la publicacion.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
		  console.log('Submit button clicked!');

		
			console.log('entro');
			const formData = new FormData();
			formData.append('username', username);
            (nombre)&&(formData.append('setnombre', nombre));
			(descripcion)&&formData.append('setdescripcion', descripcion);
			(numeroDocumento)&&formData.append('setdni', numeroDocumento);
			(mail)&&(mail!==mailViejo)&&formData.append('setmail', mail);
			(telefono)&&formData.append('settelefono', telefono);

			try {
				setMyError(false);
                console.log(`nombre: ${formData.get('setnombre')}`);
                console.log(`descripcion: ${formData.get('setadescripcion')}`);
                console.log(`dni: ${formData.get('setdni')}`);
                console.log(`mail: ${formData.get('setmail')}`);
                console.log(`telefono: ${formData.get('settelefono')}`);
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
                    <input type="file" accept="image/*" multiple required onChange={handleFotosChange} />
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
