<?php
use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

require_once __DIR__ . '/../utilities/mailSender.php';
require_once __DIR__ . '/../utilities/bdController.php';

require_once __DIR__ . '/../models/userDb.php';

$app->group('/public', function (RouteCollectorProxy $group) use ($pdo,$camposUser) {
    //obtener usuario
    $group->get('/obtenerUsuario', function (Request $req,Response $res, $args){
        $queryParams = $req->getQueryParams();

        global $usuariosHandler;

        $user = $usuariosHandler->listar($queryParams);

        $user['Mensaje'] = $usuariosHandler->mensaje;

        $res->getBody()->write(json_encode($user));
        return $res->withHeader('Content-Type', 'application/json')->withStatus($usuariosHandler->status);
    });

    //listar usuarios
    $group->get('/listarUsuarios',function (Request $req, Response $res, $args){
        $queryParams = $req->getQueryParams();

        $like = (array_key_exists('like', $queryParams)) ? $queryParams['like'] : true;

        global $usuariosHandler;

        $listado = $usuariosHandler->listar($queryParams,$like);

        $listado['Mensaje'] = $usuariosHandler->mensaje;

        $res->getBody()->write(json_encode($listado));
        return $res->withHeader('Content-Type', 'application/json')->withStatus($usuariosHandler->status);
    });

    $group->post('/newUsuario',function (Request $req, Response $res, $args) use ($pdo,$camposUser){
        $bodyParams = (array) $req->getParsedBody();
        
        global $usuariosHandler;

        $usuariosHandler->crear($bodyParams);

        $res->getBody()->write(json_encode(['Mensaje'=>$usuariosHandler]));
        return $res->withStatus($usuariosHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->post('/newVoluntario', function (Request $req, Response $res, $args) use ($pdo, $camposUser) {
        global $userDB, $centroDB, $publiDB, $centroVolunDB;
        $pudo = false;
        $status = 500;
        $msgReturn = ['Mensaje' => 'Faltan parametros'];

        $bodyParams = (array) $req->getParsedBody();
        //error_log(json_encode($bodyParams));
        if (!array_key_exists('centro',$bodyParams) || !array_key_exists('username',$bodyParams)) {
            $res->getBody()->write(json_encode($msgReturn));
            return $res->withStatus($status)->withHeader('Content-Type', 'application/json');
        }

        $validUser = $userDB->exists(['username'=>$bodyParams['username']]);
        $validCentro = $centroDB->exists(['id'=>$bodyParams['centro']]);

        if (!$validUser || !$validCentro){
            $msgReturn['Mensaje'] = 'El centro no es válido';
            $res->getBody()->write(json_encode($msgReturn));
            return $res->withStatus($status)->withHeader('Content-Type', 'application/json');
        }

        if (validarCentroVolun(['voluntario'=>$bodyParams['username']])){
            $centroVolunDB->delete(['voluntario'=>$bodyParams['username']]);
        }

        $centroVolunDB->insert(['centro'=>$bodyParams['centro'],'voluntario'=>$bodyParams['username']]);

        global $intercambioHandler, $notificacionHandler;

        $intercambioHandler->cancelar(['user'=>$bodyParams['username']], 'Se te ha asignado rol de voluntario');

        $pudo = $publiDB->update(['user'=>$bodyParams['username'],'setestado'=>'baja']);

        $pudo = $pudo && $userDB->update(['setrol'=>'volunt','username'=>$bodyParams['username']]);

        if ($pudo){
            $status = 200;
            $centro = (array) ((array)$centroDB->getFirst(['id'=>$bodyParams['centro']]))[0];
            $notificacionHandler->enviarNotificacion($bodyParams['username'],"Eres voluntario!","Has sido registrado como un voluntario del centro \"" . $centro['nombre']."\"");
        }

        $msgReturn['Mensaje'] = $status == 200 ? 'Voluntario agregado con éxito' : 'Ocurrio un error al agregar el voluntario';

        $res->getBody()->write(json_encode($msgReturn));

        return $res->withStatus($status)->withHeader('Content-Type', 'application/json');
    });

    $group->get('/obtenerCentroVolun', function (Request $req, Response $res, $args) {
        $queryParams = $req->getQueryParams();

        global $centrosHandler;

        $centro = $centrosHandler->obtenerCentroDeVoluntario($queryParams['voluntario']);
        
        $centro['Mensaje'] = $centrosHandler->mensaje;

        $res->getBody()->write(json_encode($centro));
        return $res->withHeader('Content-Type', 'application/json')->withStatus($centrosHandler->status);
    });

    $group->post('/newAdmin', function (Request $req, Response $res, $args) use ($pdo, $camposUser) {
        global $userDB, $centroDB, $publiDB, $centroVolunDB;
        $pudo = false;
        $status = 500;
        $msgReturn = ['Mensaje' => 'Faltan parametros'];

        $bodyParams = (array) $req->getParsedBody();

        if (!array_key_exists('username', $bodyParams)) {
            $res->getBody()->write(json_encode($msgReturn));
            return $res->withStatus($status)->withHeader('Content-Type', 'application/json');
        }

        if (validarCentroVolun(['voluntario' => $bodyParams['username']])) {
            $centroVolunDB->delete(['voluntario' => $bodyParams['username']]);
        }

        global $intercambioHandler, $notificacionHandler;

        $intercambioHandler->cancelar(['user' => $bodyParams['username']], 'Se te ha asignado rol de administrador');

        $pudo = $publiDB->update(['user' => $bodyParams['username'], 'setestado' => 'baja']);

        $pudo = $pudo && $userDB->update(['setrol' => 'admin', 'username' => $bodyParams['username']]);

        if ($pudo) {
            $status = 200;
            $notificacionHandler->enviarNotificacion($bodyParams['username'],'Eres administrador!', "Has sido registrado como un administrador del sistema");

            $user = (array)((array)$userDB->getFirst(['username' => $bodyParams['username']]))[0];
            if ($user['notificacion']){
                global $mailer;
                $mailer->send($user['mail'], 'Cambios de usuario!', "Has sido registrado como un administrador del sistema", true);
            }
        }

        $msgReturn['Mensaje'] = $status == 200 ? 'Administrador agregado con éxito' : 'Ocurrio un error al asignar el rol de administrador';

        $res->getBody()->write(json_encode($msgReturn));

        return $res->withStatus($status)->withHeader('Content-Type', 'application/json');
    });

    $group->delete('/deleteUsuario',function (Request $req,Response $res, $args){
        $queryParams = $req->getQueryParams();
        
        global $usuariosHandler;

        $usuariosHandler->borrar($queryParams);

        $res->getBody()->write(json_encode(['Mensaje'=>$usuariosHandler->mensaje]));

        return $res->withStatus($usuariosHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->put('/updateUsuario',function(Request $req,Response $res, $args) use ($pdo,$camposUser){
        $bodyParams = (array) $req->getParsedBody();
        
        global $usuariosHandler;

        $usuariosHandler->actualizar($bodyParams);

        error_log($usuariosHandler->mensaje);

        $res->getBody()->write(json_encode(['Mensaje'=>$usuariosHandler->mensaje]));

        return $res->withStatus($usuariosHandler->status)->withHeader('Content-Type', 'application/json');
    });
});