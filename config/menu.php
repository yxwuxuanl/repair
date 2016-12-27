<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 上午12:12
 */

return [
    'account' => [
        '1' => [
            ['账号信息', 'account/info']
        ],
        '2' => [
            ['组成员信息','group/member']
        ],
        '4' => [
            ['创建或删除帐号','admin/account']
        ],
        'label' => '账号',
    ],

    'mission' => [
        'label' => '任务',
        '1' => [
            ['我的任务','mission/self']
        ],
        '2' => [
            ['组的任务','mission/group']
        ],
        '4' => [
            ['编辑组任务','mission/group']
        ],
        '8' => [
            ['查看或编辑所有任务','admin/mission']
        ]
    ],

    'group' => [
        'label' => '组',
        '1' => [
            ['我的组','group']
        ],
        '2' => [
            ['我的组','group']
        ],
        '4' => [
            ['编辑组','admin/group']
        ],
        '8' => [
            ['创建租']
        ],
    ],

    'zone' => [
        '1' => [
            ['区域管理','admin/zone']
        ],
    ],

    'event' => [
        '1' => [
            ['事件管理','admin/event']
        ]
    ],

    'feedback' => [
        'label' => '任务追踪',

        '4' => [
            ['所有任务追踪信息','admin/feedback'],
            ['编辑任务追踪信息','admin/feedback/edit']
        ],
    ],
];