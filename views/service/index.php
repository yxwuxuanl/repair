<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 上午8:55
 */

use app\controllers\PanelController as Panel;

$panels = [];
?>

<div class="container">
    <div class="col-md-10 col-md-push-1">

        <div id="spinner">
            <div class="rect1"></div>
            <div class="rect2"></div>
            <div class="rect3"></div>
            <div class="rect4"></div>
        </div>

        <div id="nav">
            <ul id="tab" class="nav nav-tabs" role="tablist">
                <?php
                    foreach(Panel::getPanelsByRole() as $item => $value):
                ?>

                <li role="presentation" class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <?= $value['label'] ?>
                        <span class="caret"></span>
                    </a>

                    <ul class="dropdown-menu" role="menu">
                        <?php
                            foreach($value['panels'] as $panel):
                                $label = $panel[0];
                                $def = $panel[1];
                                $panels[$item][] = $def;
                        ?>

                                <li>
                                    <a href="#<?= $item . '-' . $def ?>-panel" id="<?= $item . '-' . $def  ?>-tab" tabindex="-1" data-toggle="tab"><?= $label ?></a>
                                </li>

                        <?php
                            endforeach;
                        ?>
                    </ul>
                </li>

                <?php
                    endforeach;
                ?>
            </ul>
        </div>

        <div id="panels">
            <?php
                foreach($panels as $item => $value):
                    foreach($value as $v):
            ?>

            <div class="tab-pane fade" id="<?= "{$item}-{$v}-panel"?>">
                <?= $this->render("panels/{$item}/{$v}.html") ?>
            </div>

            <?php
                    endforeach;
                endforeach;
            ?>
        </div>
    </div>
</div>