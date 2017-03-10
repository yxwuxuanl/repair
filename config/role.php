<?php

define('ROLE_NORMAL','normal');
define('ROLE_GROUP_ADMIN','group_admin');
define('ROLE_SYSTEM_ADMIN','system_admin');

return [
    'normal' => [
        'account' => 1,
        'task' => 1,
        'indexController' => 'app\controllers\index\NormalController'
    ],
    'group_admin' => [
        'account' => 1,
        'group' => 2,
        'task' => 3,
        'indexController' => 'app\controllers\index\GroupAdminController'
    ],
    'system_admin' => [
        'account' => 3,
        'system' => 1,
        'group' => 1,
        'indexController' => 'app\controllers\index\SystemAdminController'
    ]
];