<?php

use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$camposNotificacion = [
    'id'=>'?int',
    'user'=>'varchar',
    'texto'=>'text',
    'fecha'=>'?datetime',
    'visto'=>'?bool',
    'url' => 'texto'
];

$notificacionDB = new bdController('notificacion',$pdo,$camposNotificacion);

function enviarNotificacion(string $user,string $contenido,string $url = ""){
    global $notificacionDB;
    return $notificacionDB->insert(['user'=>$user,'texto'=>$contenido,'url'=>$url]);
}

function verNotificacion(int $id){
    global $notificacionDB;
    $notificacionDB->update(['id'=>$id,'setvisto'=>true]);
}

$app->group('/public', function (RouteCollectorProxy $group) {
    $group->GET('/listarNotificaciones', function (Request $request, Response $response, $args) {
        global $notificacionDB;
        $status = 404;
        $msgReturn = ['Mensaje' => 'No hay notificaciones disponibles'];

        $queryParams = $request->getQueryParams();

        $listado = (array) json_decode($notificacionDB->getAll($queryParams));

        $listado['Mensaje'] = (!empty($listado)) ? 'Notificaciones listadas con exito' : $msgReturn['Mensaje'];

        foreach ($listado as $key => $noti){
            $noti = (array) $noti;
            if (array_key_exists('id',$noti)){
                error_log("index 0 => " . $noti[0]);
                verNotificacion($noti['id']);
            }
        }

        $status = (!empty($listado)) ? 200 : 404;

        $response->getBody()->write(json_encode($listado));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    });
});