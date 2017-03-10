<?php

return [
    'system' => [
        'label' => '系统设置',
        '1' => [
            ['区域设置','zone'],
            ['事件设置','event']
        ]
    ],
    'account' => [
        'label' => '帐号管理',
        '1' => [
            ['修改密码','changepwd'],
            ['退出登录','loginout'],
        ],
        '2' => [
            ['管理帐号','manage'],
        ]
    ],
    'group' => [
        'label' => '组管理',
        '1' => [
            ['管理组','manage']
        ],
        '2' => [
            ['更改组设置','setting'],
            ['更改组成员','member']
        ],
    ],
    'task' => [
        'label' => '任务',
        '1' => [
            ['查看分配的任务','assign'],
            ['查看已完成的任务','done'],
        ],
        '2' => [
            ['查看组的未完成的任务','group'],
            ['查看组已完成的任务','group-done'],
            ['手动分配任务','manual-assign']
        ],
    ]
];