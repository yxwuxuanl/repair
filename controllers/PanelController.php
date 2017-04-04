<?php


/**
 * reated by PhpStorm.
 * User: 2m
 * Date: 2017/2/1
 * Time: 上午12:23
 */

namespace app\controllers;

use app\controllers\RoleController as Role;

class PanelController
{
    public static $panels = [
        'system' => [
            'label' => '区域与事件',
            'icon' => 'setting',
            'panels' => [
                '1' => [
                    ['区域设置', 'zone'],
                    ['事件设置', 'event']
                ]
            ]
        ],
        'statistic' => [
            'label' => '统计',
            'icon' => 'statistic',
            'panels' => [
                '1' => [
                    ['事件发生频率', 'weekevent'],
                ]
            ]
        ],
        'account' => [
            'label' => '账号',
            'icon' => 'user',
            'panels' => [
                '1' => [
                    ['修改密码', 'changepwd'],
                    ['退出登录', 'loginout'],
                ]
            ]
        ],
        'group' => [
            'label' => '部门',
            'icon' => 'group',
            'panels' => [
                '1' => [
                    ['所属部门','selfgroup'],
                ],
                '2' => [
                    ['部门成员设置', 'member'],
                    ['任务分配规则', 'taskmode']
                ],
                '8' => [
                    ['部门管理','manage']
                ]
            ]
        ]
    ];

    public static function getPanelsByRole()
    {
        $role = \Yii::$app->getSession()->get('role');
        $def = Role::$map[$role];
        $panels = [];

        unset($def['indexController']);

        foreach ($def as $name => $level) {
            $panels[$name] = static::$panels[$name];

            if (key_exists('href', $panels[$name])) {
                continue;
            }

            $panelsCopy = $panels[$name]['panels'];
            $panels[$name]['panels'] = [];

            foreach ($panelsCopy as $k => $v) {
                if ($level & $k) {
                    $panels[$name]['panels'] = array_merge($panels[$name]['panels'], $v);
                }
            }
        }

        return $panels;
    }
}
