<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 上午8:55
 */

use app\controllers\PanelController as Panel;
use app\controllers\RoleController as Role;

$panels = [];
?>

<div class="container">
    <div class="col-md-10 col-md-push-1">
        <div id="nav">
            <ul id="tab" class="nav nav-tabs" role="tablist">

                <li role="presentation">
                    <a href="#index-panel"  role="tab" data-toggle="tab">
                        <span class="text">首页</span>
                        <span class="icon index"></span>
                    </a>
                </li>

                <?php foreach (Panel::getPanelsByRole() as $panel => $config): ?>
                    <?php if (key_exists('href', $config)): ?>

                        <li role="presentation">
                            <a href="#<?= $config['href'] ?>">
                                <span class="text"><?= $config['label'] ?></span>
                                <span class="icon <?= $config['icon'] ?>"></span>
                            </a>
                        </li>

                    <?php else: ?>

                        <li role="presentation" class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                <span class="text"><?= $config['label'] ?></span>
                                <span class="caret"></span>
                                <span class="icon <?= $config['icon'] ?>"></span>
                            </a>

                            <ul class="dropdown-menu" role="menu">
                                <li><?= $config['label'] ?></li>
                                <?php foreach ($config['panels'] as $sub): ?>
                                    <li>
                                        <a href="#<?= $panel ?>-<?= $sub[1] ?>-panel"
                                           id="#<?= $panel ?>-<?= $sub[1] ?>-tab" tabindex="-1"
                                           data-toggle="tab"><?= $sub[0] ?></a>
                                    </li>
                                    <?php
                                    $panels[$panel][] = $sub[1];
                                endforeach;
                                ?>
                            </ul>
                        </li>

                    <?php endif ?>

                <?php endforeach; ?>
            </ul>
        </div>

        <div id="panels">
            <?php
            if (isset(Role::$map[Role::getRole()]['indexController'])) :
                $router = Role::$map[Role::getRole()]['indexController']; ?>

                <div class="tab-pane fade" id="index-panel">
                    <?= \Yii::$app->createController($router)[0]->actionIndex(); ?>
                </div>

            <?php endif ?>

            <?php
            foreach ($panels as $item => $value):
                foreach ($value as $v):?>

                    <div class="tab-pane fade" id="<?= "{$item}-{$v}-panel" ?>">
                        <?= $this->render("panels/{$item}/{$v}.html") ?>
                    </div>

                    <?php
                endforeach;
            endforeach; ?>
        </div>
    </div>
</div>