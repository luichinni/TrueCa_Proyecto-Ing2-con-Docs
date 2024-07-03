import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useState, useEffect, useRef } from 'react';
import { CiTrash } from 'react-icons/ci';
import { FaArrowRight,FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import "../../HarryStyles/Intercambios.css";
import "../../HarryStyles/estilos.css";
import "../../HarryStyles/Publicaciones.css";

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };
    });
};

const ModificarPublicacion = () => {
  const navigate = useNavigate();
  const hasMounted = useRef(false);

  const {id} = useParams();

  const [myError, setMyError] = useState(false);
  const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');
  const [categoria, setCategoria] = useState('');
  const [nombre, setNombre] = useState('nombre'); // aca va nombre actual y si se cambia algo se modifica de aca
  const [descripcion, setDescripcion] = useState('jiji'); // lo mismo q arriba
  const [centrosActuales, setCentrosActuales] = useState([]); // centros actuales
  const [centros, setCentros] = useState([]);
  const [imagenesActual, setImagenesActual] = useState([{id:0,archivo:'na'}]);
  const [imgActual, setImgActual] = useState(0);

  useEffect(() => {
    // aca fetcheo todo
    const fetch = async () => {
      try{
        const res = await axios.get(`http://localhost:8000/public/listarPublicaciones?id=${id}&token=${localStorage.getItem('token')}`);
        console.log(res.data);
        setImagenesActual(res.data[0].imagenes);
        setCentrosActuales(res.data[0].centros);
        setNombre(res.data[0].nombre);
        setDescripcion(res.data[0].descripcion);
        setCategoria(res.data[0].categoria);

        try {
            const resCentro = await axios.get(`http://localhost:8000/public/listarCentros?id=&nombre=&direccion=&hora_abre=&hora_cierra=`);
            console.log(resCentro.data);
            setCentros(procesar(resCentro.data));
        } catch (error) {
            console.error(error);
        }
      }catch(error){
        alert('Ups, parece que ocurrió un error');
        navigate('../MisPublicaciones');
      }
    }

  if(!hasMounted.current){
    fetch();
    hasMounted.current = true;
  }

  },[]);

  function procesar(res) {
        let resCopy = [];
        Object.keys(res).forEach(function (clave) {
            if (!isNaN(clave)) {
                resCopy[clave] = res[clave]
            }
        })
        return resCopy
    }

  const handleSubmit = async (e) => {
    // aca actualizo
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('setnombre', nombre);
    formData.append('setdescripcion', descripcion);
    formData.append('centrosActuales',JSON.stringify(centrosActuales));
    formData.append('imagenesActuales',JSON.stringify(imagenesActual));

    try {
      if (window.confirm('¿Seguro que querés modificar la publicacion?')) {
        const res = await axios.put(`http://localhost:8000/public/updatePublicacion`, formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
        alert(`Publicacion modificada con éxito`);
        navigate(`../MisPublicaciones`);
      }
    } catch (error) {
      alert(error.response.data.Mensaje);
      console.log(error);
      setMyError(true);
      setMsgError(error.response.data.Mensaje);
    }
  }

  const handleCentrosChange = (e) => {
    let centrosAux = centrosActuales;
    centrosAux.push(JSON.parse(e.target.value));
    console.log(centrosAux);
    setCentrosActuales(centrosAux);
  }

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  }

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  }

  const borrarCentro = (e) => {
    e.preventDefault();
    console.log('INFO');
    console.log(e.currentTarget.id.split('-')[1]);
    let centroAux = centrosActuales.filter(centro => centro.id != (e.currentTarget.id.split('-')[1]));
    console.log('Centros actuales: '+centroAux.length);
    setCentrosActuales(centroAux);
  }

  const borrarImage = (e) => {
    e.preventDefault();
    //console.log(imagenesActual[imgActual].archivo);
    console.log('INFO');
    console.log('imgAct '+imgActual);
    console.log()
    let imgAux = imagenesActual.filter((_,index)=> index!=imgActual);
    setImgActual(0);
    console.log('Centros actuales: '+imgAux.length);
    setImagenesActual(imgAux);

    if(imgAux.length == 0){
      setMsgError('Necesitas al menos una foto para poder guardar los cambios');
      setMyError(true);
    }else{
      setMyError(false);
    }
  }

  const avanzarFoto = (e) => {
    e.preventDefault();
    if ((imgActual+1) < imagenesActual.length){
        setImgActual(imgActual+1);
    } else if ((imgActual+1) == imagenesActual.length){
        setImgActual(0)
    }
  }

  const retrocederFoto = (e) => {
    e.preventDefault();
    if ((imgActual-1) >= 0) {
        setImgActual(imgActual-1);
    } else if ((imgActual - 1) < 0){
        setImgActual(imagenesActual.length - 1)
    }
  }

  const handleFotosChange = async (e) => {
      if (e.target.files.length <= (10 - imagenesActual.length)){
          setMyError(false);
          const base64Array = imagenesActual;
          for (const file of e.target.files) {
              const base64 = await fileToBase64(file);
              base64Array.push({archivo:base64});
          }
          setImagenesActual(base64Array);
      }else{
          setMsgError('Solo puedes cargar hasta 10 imagenes');
          setMyError(true);
      }
  };

  return(
    <>
    <br/><br/><br/><br/><br/><br/><br/>
    <form onSubmit={handleSubmit}>
      <label style={{color:'grey',background:'#fdfd96'}}>Tenga en cuenta que los centros o imagenes que elimine no serán permanentes hasta que guarde los cambios</label>
      <label>Titulo</label>
      <input type="text" value={nombre} onChange={handleNombreChange} placeholder='Nombre de publicación' required/>
      <br /><br />
      <label>Descripción</label>
      <textarea value={descripcion} onChange={handleDescripcionChange} maxLength="255" placeholder='Descripción' required></textarea>
      <br /><br />
      {(centrosActuales.length > 0) && (
        <label>Centros Actuales</label>
      )}
      {(centrosActuales)&&centrosActuales.map(centro => (
          <>
          <div id={'div-centro-'+centro.id} style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
            <button onClick={borrarCentro} id={'centro-'+centro.id} className='botonCampanita'>
              <CiTrash size={32}/>
            </button>
            <label style={{"margin-left": "10px",display: "flex","align-items": "center"}}>{centro.nombre}</label>
          </div>
          <br/>
          </>
      ))}
      {(centrosActuales.length < 3 && centros.length > centrosActuales.length) && (
        <>
          <label>Puedes seleccionar {3 - centrosActuales.length} centro/s más</label>
          <select id="centros" onChange={handleCentrosChange}>
              <option value="">Seleccione un centro</option>
              {centros.map((centro) => (
                  (centrosActuales.filter(c => c.id != centro.id).length == centrosActuales.length) ? (
                  <option key={centro.id} value={JSON.stringify(centro)}>
                      {centro.nombre}
                  </option>
                  ) : <></>
              ))}
          </select>
          <br/>
          <br/>
        </>
      )}
      <label>Imagenes Actuales {(imagenesActual[1])&&'(use las flechas para avanzar y retroceder)'} </label>
      <img className="publicacion-img img" src={(imagenesActual[imgActual]) ? imagenesActual[imgActual].archivo : ''} alt="imagen no encontrada" />
      <div className="botones-imagenes">
        <button onClick={borrarImage} id={'image'} className='botonCampanita'>
          <CiTrash size={32}/>
        </button>
        {(imagenesActual[1])&&(
          <>
              <button className='botonCampanita' onClick={retrocederFoto}>
                  <FaArrowLeft size={32} className='botonCampanita' />
              </button>
              <button className='botonCampanita' onClick={avanzarFoto}>
                  <FaArrowRight size={32} className='botonCampanita' />
              </button>
          </>
        )}
      </div>
      {(imagenesActual.length < 10) && (
        <>
          <label>Puedes seleccionar {10 - imagenesActual.length} imagen/es más</label>
          <input type="file" accept="image/*" multiple onChange={handleFotosChange} />
        </>
      )}
      <br/>
      <br/>
      <ButtonSubmit text="Editar producto!" />
      <br/>
      <br/>
    </form>
    {myError &&
      <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
    }
    </>
  );
	/* const navigate = useNavigate(); 
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [centros, setCentros] = useState([]);

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
                <input type="text" value={nombre} onChange={handleNombreChange} placeholder={nombre} required />
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
    ); */
};

export default ModificarPublicacion;

