import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DeleteCentro = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const hasMounted = useRef(false);

  useEffect(() => {
    const DeleteCentro = async () => {
      try {
        if (window.confirm('¿Seguro que querés eliminar el centro?')) {
          await axios.delete(`http://localhost:8000/public/deleteCentro?id=${id}`);
          alert(`Centro eliminado`);
          navigate(`../Centros`); 
        } else {
          navigate(`../Centros`);
        }
      } catch (error) {
        alert('No se pudo eliminar el centro.\nComprueba que no tenga voluntarios asignados!');
        navigate(`../Centros`);
      }
    };
    if(!hasMounted.current){
      DeleteCentro();
      hasMounted.current = true;
    }
  }, []); // Pasamos un array vacío como segundo argumento

  return null; // No renderizamos nada en esta página
};

export default DeleteCentro;