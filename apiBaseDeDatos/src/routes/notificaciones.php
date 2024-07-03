<?php

use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../models/notificacionDb.php';

$app->group('/public', function (RouteCollectorProxy $group) {
    $group->GET('/listarNotificaciones', function (Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();

        global $notificacionHandler;

        $listado = $notificacionHandler->listar($queryParams);

        $listado['Mensaje'] = $notificacionHandler->mensaje;

        $response->getBody()->write(json_encode($listado));
        return $response->withStatus($notificacionHandler->status)->withHeader('Content-Type', 'application/json');
    });
});