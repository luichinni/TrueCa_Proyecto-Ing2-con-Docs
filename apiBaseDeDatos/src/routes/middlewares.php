<?php

use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

require_once __DIR__ . '/../utilities/bdController.php';

$onlyUser = function (Request $req, RequestHandler $handler){
    $res = $handler->handle($req);
    $body = (array) json_decode($res->getBody());

    if ($body['rolActivo'] != 'user'){
        $res = new Response();
        $res->getBody()->write("{'Mensaje':'No puedes hacer eso :c'}");
        return $res->withStatus(403);//Forbidden
    }

    return $res;
};

$onlyAdmin = function (Request $req, RequestHandler $handler) {
    $res = $handler->handle($req);
    $body = (array) json_decode($res->getBody());

    if ($body['rolActivo'] != 'admin') {
        $res = new Response();
        $res->getBody()->write("{'Mensaje':'No puedes hacer eso :c'}");
        return $res->withStatus(403); //Forbidden
    }

    return $res;
};

$onlyVoluntAdmin = function (Request $req, RequestHandler $handler) {
    $res = $handler->handle($req);
    $body = (array) json_decode($res->getBody());

    if ($body['rolActivo'] == 'user') {
        $res = new Response();
        $res->getBody()->write("{'Mensaje':'No puedes hacer eso :c'}");
        return $res->withStatus(403); //Forbidden
    }

    return $res;
};

function validarSesion($req){
    $queryParams = $req->getQueryParams();
    $queryParams = $queryParams == null ? [] : $queryParams;
    $ret = false;
    if (array_key_exists('token', $queryParams)) {
        if ($queryParams['token'] == 'tokenUser' || $queryParams['token'] == 'tokenVolunt' || $queryParams['token'] == 'tokenAdmin') {
            $ret = true;
        }
    }
    return $ret;
}

function getSessionUserRol($req){
    $queryParams = $req->getQueryParams();
    $queryParams = $queryParams == null ? [] : $queryParams;
    $ret = '';
    if (array_key_exists('token', $queryParams)) {
        match ($queryParams['token']){
            'tokenUser' => $ret = 'user',
            'tokenVolunt' => $ret = 'volunt',
            'tokenAdmin' => $ret = 'admin',
            default => $ret = 'none'
        };
    }
    return $ret;
}

$app->add(function (Request $req, RequestHandler $handler) use ($app){
    $res = $handler->handle($req);
    //$res = $app->getResponseFactory()->createResponse();
    $body = (array) json_decode($res->getBody());
    $body['activa'] = validarSesion($req);
    $body['rolActivo'] = getSessionUserRol($req);
    $status = $res->getStatusCode();
    $res = $app->getResponseFactory()->createResponse();
    $res->getBody()->write(json_encode($body));
    return $res->withStatus($status)->withHeader('Content-Type', 'application/json');
});