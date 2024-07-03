<?php

use Collections\CollectionsStream;
require_once __DIR__ . '/../utilities/bdController.php';

class IntercambiosHandler extends BaseHandler{
    protected PublicacionesHandler $publiHandler;

    public function setPublicacionesHandler(PublicacionesHandler $publicacionesHandler){
        $this->publiHandler = $publicacionesHandler;
    }

    function __construct(bdController $db, protected UsuariosHandler $userHandler, protected CentroHandler $centroHandler , protected NotificacionesHandler $notificacionesHandler)
    {
        parent::__construct($db);
    }

    protected function restriccionBorrado(array $datos){// true -> restringido, false -> puede seguir
        // mepa no tiene
        return false;
    }
    protected function eliminarDependencias(array $datos){
        // no tiene
    }
    public function validarDatos(array $data, bool $todos)
    {
        $campos = ['voluntario', 'publicacionOferta', 'publicacionOfertada', 'ofertaAcepta', 'ofertadaAcepta', 'horario', 'estado', 'descripcion', 'donacion', 'centro'];

        $valido = false;

        if ($todos && !$this->db->comprobarObligatorios($data)) {
            $this->mensaje = 'Faltan campos por completar';
            return false;
        }

        match (true) {
            (array_key_exists('publicacionOferta', $data)) && (/* comprobar existe */!$this->publiHandler->existe(['id'=>$data['publicacionOferta']],true)) => $this->mensaje = 'La publicacion de oferta no es válida',
            (array_key_exists('publicacionOfertada', $data)) && (/* comprobar existe */!$this->publiHandler->existe(['id' => $data['publicacionOfertada']], true)) => $this->mensaje = 'La publicación que quieres ofrecer no es válida',
            (array_key_exists('publicacionOferta', $data) && array_key_exists('publicacionOfertada', $data)) && (/* comprobar categorias */$this->publiHandler->categoria($data['publicacionOferta'])!= $this->publiHandler->categoria($data['publicacionOfertada'])) => $this->mensaje = 'Las publicaciones deben ser de la misma categoría',
            (array_key_exists('ofertaAcepta', $data)) && (/* comprobar bool */$data['ofertaAcepta']!=1 && $data['ofertaAcepta'] != 0) => $this->mensaje = 'La confirmación falló',
            (array_key_exists('ofertadaAcepta', $data)) && (/* comprobar bool */$data['ofertadaAcepta'] != 1 && $data['ofertadaAcepta'] != 0) => $this->mensaje = 'La confirmación falló',
            (array_key_exists('centro', $data)) && (/* comprobar existe */!$this->centroHandler->existe(['id'=>$data['centro']],true)) => $this->mensaje = 'El centro elegido no es válido',
            (array_key_exists('voluntario', $data)) && (/* comprobar existe user */!$this->userHandler->existe(['username'=>$data['voluntario']]) || /* comprobar centro volun */ !validarCentroVolun($data)) => $this->mensaje = 'El voluntario es inválido',
            (array_key_exists('horario', $data)) && (/* comprobar que este dentro del rango del centro */!$this->centroHandler->comprobarHorario($data['centro'],explode(" ",$data['horario'])[1])) => $this->mensaje = 'El horario de intercambio no es válido' . ': ' . $this->centroHandler->mensaje,
            (array_key_exists('estado', $data)) && (/* comprobar sea del enum */!in_array($data['estado'],['pendiente', 'cancelado', 'rechazado', 'aceptado', 'concretado'])) => $this->mensaje = 'No pudo cambiarse el estado del intercambio',
            (array_key_exists('descripcion', $data)) && (/* comprobar vacio */strlen($data['descripcion'])==0) => $this->mensaje = 'La descripción de intercambio no es válida',
            (array_key_exists('donacion', $data)) && (/* comprobar bool */$data['donacion'] != 1 && $data['donacion'] != 0) => $this->mensaje = 'No pudo procesarse la confirmación de donación',
            (array_key_exists('publicacionOferta', $data) && array_key_exists('publicacionOfertada', $data))&&(/* comproba que no haya un intercambio ya */($this->existe(['publicacionOferta'=>$data['publicacionOferta'],'publicacionOfertada'=>$data['publicacionOfertada'], 'estado'=>'pendiente'])) || ($this->existe(['publicacionOferta' => $data['publicacionOfertada'], 'publicacionOfertada' => $data['publicacionOferta'], 'estado' => 'pendiente'])) || ($this->existe(['publicacionOferta' => $data['publicacionOferta'], 'publicacionOfertada' => $data['publicacionOfertada'], 'estado' => 'aceptada'])) || ($this->existe(['publicacionOferta' => $data['publicacionOfertada'], 'publicacionOfertada' => $data['publicacionOferta'], 'estado' => 'aceptada']))) => $this->mensaje = 'Ya hay un intercambio activo entre estas publicaciones',
            (array_key_exists('motivo', $data)) && (!in_array($data['motivo'],['una publicacion dada de baja', 'ausencia ambas partes', 'ausencia anunciante', 'ausencia ofertante', 'producto anunciado no es lo esperado', 'producto ofertado no es lo esperado', 'se eligió una oferta superadora', 'el producto no es de interes', 'fecha y hora no convenientes', 'centro dado de baja'])) =>$this->mensaje = 'El motivo no es válido',
            default => $valido = true
        };
        return $valido;
    }

    // cancelar
    public function cancelar(array $datos, string $motivo){
        $datos['setestado'] = 'cancelado';
        $datos['setmotivo'] = $motivo;
        
        if ($motivo != '' && $this->actualizar($datos)){
            $intercambio = (array)$this->listar($datos)[0];
            $publiOferta = (array)$this->publiHandler->listar(['id'=> $intercambio['publicacionOferta']])[0];
            $publiOfertada = (array)$this->publiHandler->listar(['id' => $intercambio['publicacionOfertada']])[0];
            $this->notificacionesHandler->enviarNotificacion($publiOferta['user'],'Intercambio cancelado!','Se canceló el intercambio de '.$publiOferta['nombre'].' por '.$publiOfertada['nombre'] . ', motivo: ' . $motivo,'');
            $this->notificacionesHandler->enviarNotificacion($publiOfertada['user'], 'Intercambio cancelado!', 'Se canceló el intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'] . ', motivo: ' . $motivo, '');
            $this->mensaje = "Cancelado con éxito";
/*             if ($motivo == 'ausencia ambas partes'){
                
            } */
        }else{
            $this->mensaje = "No se pudo cancelar el intercambio correctamente";
            $this->status = 500;
        }
    }
    public function crear(array $datos)
    {
        parent::crear($datos);
        $publiOferta = (array)$this->publiHandler->listar(['id' => $datos['publicacionOferta']])[0];
        $publiOfertada = (array)$this->publiHandler->listar(['id' => $datos['publicacionOfertada']])[0];
        $this->notificacionesHandler->enviarNotificacion($publiOferta['user'], 'Nuevo Intercambio!', 'El intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'] . ' está pendiente de respuesta.', '');
        $this->notificacionesHandler->enviarNotificacion($publiOfertada['user'], 'Nuevo Intercambio!', 'El intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'] . ' está pendiente de respuesta.', '');
        $this->mensaje = "Ofrecido con éxito";
    }
    // rechazar
    public function rechazar(array $datos, string $motivo){
        $datos['setestado'] = 'rechazado';
        $datos['setmotivo'] = $motivo;

        if ($motivo != '' && $this->actualizar($datos)) {
            $intercambio = (array)((array)$this->listar($datos))[0];
            $publiOferta = (array)$this->publiHandler->listar(['id' => $intercambio['publicacionOferta']])[0];
            $publiOfertada = (array)$this->publiHandler->listar(['id' => $intercambio['publicacionOfertada']])[0];
            $this->notificacionesHandler->enviarNotificacion($publiOferta['user'], 'Intercambio rechazado!', 'Se rechazó el intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'] . ', motivo: ' . $motivo, '');
            $this->notificacionesHandler->enviarNotificacion($publiOfertada['user'], 'Intercambio rechazado!', 'Se rechazó el intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'] . ', motivo: ' . $motivo, '');
            $this->mensaje = "Rechazado con éxito";
        } else {
            $this->mensaje = "No se pudo rechazar el intercambio correctamente";
            $this->status = 500;
        }
    }
    // aceptar
    public function aceptar(array $datos){
        $datos['setestado'] = 'aceptado';
        $this->actualizar($datos);
        $intercambio = (array)$this->listar(['id'=>$datos['id']])[0];
        $publiOferta = (array)$this->publiHandler->listar(['id' => $intercambio['publicacionOferta']])[0];
        $publiOfertada = (array)$this->publiHandler->listar(['id' => $intercambio['publicacionOfertada']])[0];
        $this->publiHandler->bajaPorIntercambio($publiOferta['id']);
        $this->publiHandler->bajaPorIntercambio($publiOfertada['id']);
        $this->notificacionesHandler->enviarNotificacion($publiOferta['user'], 'Intercambio aceptado!', 'Se aceptó el intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'], '');
        $this->notificacionesHandler->enviarNotificacion($publiOfertada['user'], 'Intercambio aceptado!', 'Se aceptó el intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'], '');
        $this->mensaje = "Aceptado con éxito";
        $this->status = 200;
    }
    // validar
    public function validar(array $datos){
        $datos['setestado'] = 'concretado';
        $this->actualizar($datos);
        $intercambio = (array)$this->listar($datos)[0];
        $publiOferta = (array)$this->publiHandler->listar(['id' => $intercambio['publicacionOferta']])[0];
        $publiOfertada = (array)$this->publiHandler->listar(['id' => $intercambio['publicacionOfertada']])[0];
        $this->notificacionesHandler->enviarNotificacion($publiOferta['user'], 'Intercambio aceptado!', 'Se aceptó el intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'], '');
        $this->notificacionesHandler->enviarNotificacion($publiOfertada['user'], 'Intercambio aceptado!', 'Se aceptó el intercambio de ' . $publiOferta['nombre'] . ' por ' . $publiOfertada['nombre'], '');
        $this->mensaje = "Aceptado con éxito";
    }

    public function listar(array $datos, bool $like = false, bool $centro_id = false)
    {        
        $whereArr = [];

        if (array_key_exists('estado',$datos)) $whereArr['estado'] = $datos['estado'];
        if (array_key_exists('centro', $datos)) $whereArr['centro'] = $datos['centro'];
        if (array_key_exists('donacion', $datos)) $whereArr['donacion'] = $datos['donacion'];

        $listado = parent::listar($whereArr,$like);

        $publiHandler = $this->publiHandler;
        $stream = new CollectionsStream($listado);
        $return = $stream
            ->filter(function ($intercambio) use ($datos,$like,$publiHandler){
                return !array_key_exists('username',$datos) || (array_key_exists('username', $datos) && $datos['username']=='') || $publiHandler->getDueño($intercambio['publicacionOferta']) == $datos['username'] || $publiHandler->getDueño($intercambio['publicacionOfertada']) == $datos['username'];
            })
            ->filter(function ($intercambio) use ($datos, $like, $publiHandler) {
                // obtener todas las publis y si publi nombre = datos oferta, nos quedamos con los intercambios cuyo id sea el de la publi
                $valido = 0;
                if (array_key_exists('publicacionOferta',$datos) && $datos['publicacionOferta'] != ''){
                    $valido = count((new CollectionsStream($publiHandler->listar(['nombre' => $datos['publicacionOferta'],/* 'user'=>$datos['username'] */], $like)))
                    ->filter(function ($publi) use ($intercambio) {
                        return $intercambio['publicacionOferta'] == $publi['id'];
                    })->get());    
                }
                error_log('Valido1 = '.$valido);
                return (!array_key_exists('publicacionOferta', $datos) || $datos['publicacionOferta'] == '' || ($valido != 0));
            })
            ->filter(function ($intercambio) use ($datos, $like, $publiHandler) { // true lo deja, false lo quita
                // obtener todas las publis y si publi nombre = datos oferta, nos quedamos con los intercambios cuyo id sea el de la publi
                $valido = 0;
                if (array_key_exists('publicacionOfertada', $datos) && $datos['publicacionOfertada'] != '') {
                    $valido = count((new CollectionsStream($publiHandler->listar(['nombre' => $datos['publicacionOfertada'], /* 'user' => $datos['username'] */], $like)))
                        ->filter(function ($publi) use ($intercambio) {
                            return $intercambio['publicacionOfertada'] == $publi['id'];
                        })->get());
                }
                //error_log('Valido2 = ' . $valido);
                return (!array_key_exists('publicacionOfertada', $datos) || $datos['publicacionOfertada'] == '' || ($valido != 0));
            })
            ->distinct(fn ($i1, $i2) => $i1['id'] == $i2['id'])
            ->get();

        if(!$centro_id){
            $newArr = [];
            foreach($return as $pos=>$intercambio){
                $intercambio['centro'] = $this->centroHandler->nombre($intercambio['centro']);
                $newArr[] = $intercambio;
            }
            $return = $newArr;
        }

        $this->status = (count($return) == 0) ? 404 : 200;
        $this->mensaje = (count($return) == 0 ) ? 'No se encontraron intercambios' : 'Intercambios listados con exito';

        return $return;
    }

}