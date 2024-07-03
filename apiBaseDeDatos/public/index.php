<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/models/db.php';
require_once __DIR__ . '/../src/utilities/mailSender.php';
use Slim\Factory\AppFactory;

$app = AppFactory::create();
header("Access-Control-Allow-Origin: *");
header('access-control-allow-Methods: GET, POST, PUT, DELETE');
header('access-control-allow-Headers: Content-Type');

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:3000') // Cambia esto a la URL de tu frontend
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});


$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

$credenciales = (array) json_decode(file_get_contents('../src/utilities/credenciales.json'));
$mailer = new mailSender($credenciales['Username'],$credenciales['Password'],$credenciales['mail']);

require_once __DIR__ . '/../src/routes/sesionActiva.php';
require_once __DIR__ . '/../src/routes/middlewares.php';

require_once __DIR__ . '/../src/models/userDb.php';
require_once __DIR__ . '/../src/models/categoriaDb.php';
require_once __DIR__ . '/../src/models/centroDb.php';
require_once __DIR__ . '/../src/models/publiDb.php';
require_once __DIR__ . '/../src/models/publiCentroDb.php';
require_once __DIR__ . '/../src/models/centroVolunDb.php';
require_once __DIR__ . '/../src/models/comentariosDb.php';
require_once __DIR__ . '/../src/models/intercambioDb.php';
require_once __DIR__ . '/../src/models/notificacionDb.php';
require_once __DIR__ . '/../src/models/valoracionDb.php';

require_once __DIR__ . '/../src/modules/base.modules.php';
require_once __DIR__ . '/../src/modules/usuarios.modules.php';
require_once __DIR__ . '/../src/modules/categorias.modules.php';
require_once __DIR__ . '/../src/modules/notificaciones.modules.php';
require_once __DIR__ . '/../src/modules/centros.modules.php';
require_once __DIR__ . '/../src/modules/publi_centro.php';
require_once __DIR__ . '/../src/modules/centroVolun.php';
require_once __DIR__ . '/../src/modules/comentarios.modules.php';
require_once __DIR__ . '/../src/modules/intercambios.modules.php';
require_once __DIR__ . '/../src/modules/publicaciones.modules.php';
require_once __DIR__ . '/../src/modules/valoraciones.modules.php';
require_once __DIR__ . '/../src/modules/estadisticas.modules.php';

$usuariosHandler = new UsuariosHandler($userDB);
$categoriasHandler = new CategoriaHandler($categoriaDB);
$notificacionHandler = new NotificacionesHandler($notificacionDB,$usuariosHandler,$mailer);
$centrosHandler = new CentroHandler($centroDB);
$intercambioHandler = new IntercambiosHandler($intercambioDB,$usuariosHandler,$centrosHandler,$notificacionHandler);
$publicacionesHandler = new PublicacionesHandler($publiDB,$categoriasHandler,$notificacionHandler,$intercambioHandler,$centrosHandler);
$centrosHandler->setIntercambiosHandler($intercambioHandler);
$centrosHandler->setPublicacionesHandler($publicacionesHandler);
$categoriasHandler->setPublicacionesHandler($publicacionesHandler);
$intercambioHandler->setPublicacionesHandler($publicacionesHandler);
$comentariosHandler = new ComentariosHandler($comentariosDB,$publicacionesHandler,$usuariosHandler, $notificacionHandler);
$valoracionesHandler = new ValoracionesHandler($valoracionesDB,$usuariosHandler);
$estadisticador = new Estadisticas($intercambioHandler);

require_once __DIR__ . '/../src/routes/usuarios.php';
require_once __DIR__ . '/../src/routes/cetegorias.php';
require_once __DIR__ . '/../src/routes/centros.php';
require_once __DIR__ . '/../src/routes/publicacion.php';
require_once __DIR__ . '/../src/routes/imagen.php';
require_once __DIR__ . '/../src/routes/comentarios.php';
require_once __DIR__ . '/../src/routes/intercambios.php';
require_once __DIR__ . '/../src/routes/notificaciones.php';
require_once __DIR__ . '/../src/routes/valoraciones.php';

$app->run();
?>