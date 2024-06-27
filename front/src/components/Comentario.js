import { Link } from 'react-router-dom';
import '../HarryStyles/Comentario.css';

const Comentario = ({ id, user, texto, respondeA, fecha_publicacion }) => {
  return (
    <fieldset className="comentario">
      <div className="comentario-info">
        <p className="user">{user}</p>
        <p className="texto">{texto}</p>
        {respondeA && (
          <p className="respondeA">Responde a: {respondeA}</p>
        )}
        <p className="fecha">Publicado el: {new Date(fecha_publicacion).toLocaleDateString()}</p>

        {token === 'tokenAdmin' && (// si soy un admin, el dueño de la publicación o la persona que comento
          <Link to={"/deleteComentario/" + props.Id} className="botonEliminar"> Eliminar </Link>
        )}
      </div>
    </fieldset>
  );
}

export default Comentario;
