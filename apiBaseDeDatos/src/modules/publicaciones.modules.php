<?php

use Collections\CollectionsStream;

require_once __DIR__ . '/../utilities/bdController.php';

class PublicacionesHandler extends BaseHandler{
    function __construct(bdController $db, protected CategoriaHandler $categoriaHandler, protected NotificacionesHandler $notificacionesHandler, protected IntercambiosHandler $intercambiosHandler, protected CentroHandler $centroHandler)
    {
        parent::__construct($db);
    }

    protected function restriccionBorrado(array $datos){// true -> restringido, false -> puede seguir
        // no se borran?
        return false;
    } 
    protected function eliminarDependencias(array $datos){
        // imagenes y publi centros, como no las borro quizás no importa
    }
    public function validarDatos(array $data, bool $todos){
        $campos = ['nombre', 'descripcion', 'categoria'];

        $valido = false;

        if ($todos && !$this->db->comprobarObligatorios($data)) {
            $this->mensaje = 'Faltan campos por completar';
            return false;
        }

        match (true) {
            (array_key_exists('nombre', $data)) && (strlen($data['nombre']) <= 1) => $this->mensaje = 'La publicacion debe tener nombre',
            (array_key_exists('descripcion', $data)) && ((strlen($data['descripcion']) > 255) || (strlen($data['descripcion']) < 2)) => $this->mensaje = 'La publicacion debe tener descripcion',
            (array_key_exists('categoria_id', $data)) && ($data['categoria_id'] == '' || !$this->categoriaHandler->existe(['id'=>$data['categoria_id']])) => $this->mensaje = 'La publicacion debe tener categoría',
            default => $valido = true
        };
        return $valido;
    }

    public function actualizar(array $datos)
    {
        $pudo = parent::actualizar($datos);
        if(array_key_exists('id',$datos)&& array_key_exists('imagenesActuales',$datos)){
            eliminarImg(['publicacion' => $datos['id']]);
            foreach ($datos['imagenesActuales'] as $img) {
                $img = (array)$img;
                agregarImg(['publicacion'=>$datos['id'],'archivo'=>$img['archivo']]);
            }
        }

        if (array_key_exists('id', $datos) && array_key_exists('centrosActuales', $datos)) {
            borrarPubliCentro(['publicacion'=>$datos['id']]);
            foreach ($datos['centrosActuales'] as $centro) {
                $centro = (array)$centro;
                agregarPubliCentros(['publicacion'=>$datos['id'],'centro'=>$centro['id']]);
            }
        }
        return $pudo;
    }

    public function baja(array $datos){
        $pudo = false;
        $publicaciones = $this->listar($datos);
        if (empty($publicaciones)){
            $this->mensaje = 'No existen publicacion para dar de baja';
            return $pudo;
        }

        foreach($publicaciones as $pos=>$publi){
            $this->actualizar(['id'=>$publi['id'],'setestado'=>'baja']);
            $this->notificacionesHandler->enviarNotificacion($publi['user'],'Publicacion dada de baja', 'Tu publicacion "'.$publi['nombre'].'" fue dada de baja');
            $motivo = 'La publicación ' . $publi['nombre'] . ' fue dada de baja';
            $this->intercambiosHandler->cancelar(['publicacionOferta'=>$publi['id'], 'estado' => 'pendiente'], $motivo);
            $this->intercambiosHandler->cancelar(['publicacionOfertada'=>$publi['id'], 'estado' => 'pendiente'], $motivo);
            $this->intercambiosHandler->cancelar(['publicacionOferta' => $publi['id'], 'estado' => 'aceptada'], $motivo);
            $this->intercambiosHandler->cancelar(['publicacionOfertada' => $publi['id'], 'estado' => 'aceptada'], $motivo);
        }

        $pudo = true;
        return $pudo;
    }

    public function alta(array $datos){
        $pudo = false;
        $publicaciones = $this->listar($datos);
        if (empty($publicaciones)) {
            $this->mensaje = 'No existen publicacion para dar de alta';
            return $pudo;
        }

        foreach ($publicaciones as $pos => $publi) {
            $this->actualizar(['id' => $publi['id'], 'setestado' => 'alta']);
            $this->notificacionesHandler->enviarNotificacion($publi['user'], 'Publicacion dada de alta', 'Tu publicacion "' . $publi['nombre'] . '" fue dada de alta');
        }

        $pudo = true;
        return $pudo;
    }
    
    public function categoria(int|string $id){
        $publi = (array)$this->listar(['id'=>$id]);
        if (empty($publi)) return false;

        $publi = $publi[0];
        return $publi['categoria_id'];
    }

    public function listar(array $datos, bool $like = false,bool $categoria_id = false, bool $centros = false, bool $imagenes = false, bool $conHabilitacion = false){
        $listado = parent::listar($datos,$like);

        if (!$categoria_id && !empty($listado)){
            $newList = [];
            foreach ($listado as $pos => $publi) {
                $publi['categoria_id'] = $this->categoriaHandler->nombre($publi['categoria_id']);
                $newList[$pos] = $publi;
            }
            $listado = $newList;
        }

        if ($centros && !empty($listado)){
            $newList = [];
            foreach ($listado as $pos => $publi) {
                $where = ['publicacion'=>$publi['id']];
                $publiCent = (array)listarPubliCentros($where);
                $habilitados = true;
                for ($i = 0; $i < count($publiCent); $i++) {
                    $tempArr = (array) $publiCent[$i];
                    $wherCentro = ['id' => $tempArr['centro']];
                    $publi['centros'][$i] = ((array)$this->centroHandler->listar($wherCentro))[0];
                    if ($this->centroHandler->existe($wherCentro,true)) $habilitados = $habilitados && $this->centroHandler->habilitado($tempArr['centro']);
                }
                if($conHabilitacion && $habilitados) $newList[$pos] = $publi;
                else if (!$conHabilitacion) $newList[$pos] = $publi;
            }
            $listado = $newList;
        }

        if ($imagenes && !empty($listado)){
            $newList = [];
            foreach ($listado as $pos => $publi){
                $where = ['publicacion' => $publi['id']];
                $publi['imagenes'] = listarImg($where);
                $newList[$pos] = $publi;
            }
            $listado = $newList;
        }

        error_log('Publis: ' . json_encode($listado));

        return $listado;
    }

    public function idPorNombre(string $nombre){
        if ($nombre == '' || !$this->existe(['nombre' => $nombre])) return false;

        $publicacion = (array)$this->listar(['nombre' => $nombre]);

        $publicacion = $publicacion[0];
        return $publicacion['id'];
    }

    public function getDueño(int|string $id){
        if (!$this->existe(['id' => $id])) return false;

        $publi = (array)$this->listar(['id' => $id]);

        if (empty($publi)) return false;

        $publi = $publi[0];
        return $publi['user'];
    }

    public function crear(array $datos)
    {
        if(parent::crear($datos)){
            foreach($datos as $clave => $valor){
                if (str_starts_with($clave, 'foto')){
                    agregarImg(['publicacion'=>$this->lastId,'archivo'=>$valor]);
                }else if(str_starts_with($clave, 'centro')){
                    agregarPubliCentros(['publicacion'=>$this->lastId,'centro'=>$valor]);
                }
            }
        }
    }

}