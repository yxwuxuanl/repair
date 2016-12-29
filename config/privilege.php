<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/18
 * Time: 上午9:18
 */

define('P_ACCOUNT_NEW_ACCOUNT', 'account_0');
define('P_ACCOUNT_CHECK_SELF','account_1');
define('P_ACCOUNT_PRIMARY_ACCOUNT','account_2');
define('P_ACCOUNT_SYSTEM','account_4');

define('P_SYSTEM_ZONE','system_1');
define('P_SYSTEM_EVENT','system_2');

define('P_GROUP_CHECK_SELF','group_1');
define('P_GROUP_EDIT_SELF', 'group_2');
define('P_GROUP_MAMAGER', 'group_4');
define('P_GROUP_CREATR', 'group_8');

define('P_MISSION_CHECK_GROUP', 'mission_1');
define('P_MISSION_CHECK_SELF', 'mission_2');
define('P_MISSION_INVALID', 'mission_4');

return [
    'account' => [ 
        'label' => '帐号',
        '0' => [
            'desc' => '新帐号',
            'constant' => P_ACCOUNT_NEW_ACCOUNT,
            'panels' => []
        ],
        '1' => [
            'desc' => '查看及修改自身帐号的权限',
            'constant' => P_ACCOUNT_CHECK_SELF,
            'panels' => [
                [
                    '账号信息','info'
                ],
                [
                    '修改密码','editpwd'
                ],
                [
                    '退出登录','loginout'
                ]
            ],
        ],
        '2' => [
            'desc' => '关键帐号',
            'constant' => P_ACCOUNT_PRIMARY_ACCOUNT,
            'panels' => []
        ],
        '4' => [
            'desc' => '添加和删除账户权限',
            'constant' => P_ACCOUNT_SYSTEM,
            'panels' => [
                [
                    '查看所有账号','checkall'
                ],
                [
                    '新建帐号','create'
                ],
                [
                    '删除帐号','remove'
                ],
                [
                    '权限分配','privilege'
                ]
            ]
        ]
    ],

    'system' => [
        'label' => '系统管理',
        '1' => [
            'desc' => '增加及删除故障区域权限',
            'constant' => P_SYSTEM_ZONE,
            'panels' => [
                [
                    '区域管理','zone'
                ]
            ]
        ],
        '2' => [
            'desc' => '增加及删除事件权限',
            'constant' => P_SYSTEM_EVENT,
            'panels' => [
                [
                    '事件管理','event'
                ]
            ]
        ]
    ],

    'group' => [
        'label' => '组',
        '1' => [
            'desc' => '查看所属组的信息',
            'constant' => P_GROUP_CHECK_SELF,
            'panels' => [
                [
                    '查看所属组','self'
                ]
            ]
        ],
        '2' => [
            'desc' => '更改所属组的信息',
            'constant' => P_GROUP_EDIT_SELF,
            'panels' => [
                [
                    '修改组成员','grew'
                ],
                [
                    '修改组的事件','event'
                ]
            ]
        ],
        '4' => [
            'desc' => '组管理员',
            'constant' => P_GROUP_MAMAGER,
            'panels' => []
        ],
        '8' => [
            'desc' => '创建组',
            'constant' => P_GROUP_CREATR,
            'panels' => [
                [
                    '创建组','create'
                ]
            ]
        ]
    ],

    'mission' => [
        'label' => '任务',
        '1' => [
            'desc' => '查看组的任务',
            'constant' => P_MISSION_CHECK_GROUP,
            'panels' => [
                [
                    '查看组任务','group'
                ]
            ]
        ],
        '2' => [
            'desc' => '查看自身任务',
            'constant' => P_MISSION_CHECK_SELF,
            'panels' => [
                [
                    '进行中的任务','execute'
                ],
                [
                    '已完成的任务','complete'
                ]
            ],
        ],
        '4' => [
            'desc' => '处理无效报障',
            'constant' => P_MISSION_INVALID,
            'panels' => [
                [
                    '处理无效报障','invalid'
                ]
            ]
        ]
    ]
];