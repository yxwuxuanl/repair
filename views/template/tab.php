<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 下午3:09
 */

// panel('index');

?>

<ul id="nav" class="nav nav-tabs" role="tablist">

    <?php
        foreach($privilege as $name => $value):

            if(empty($value))
            {
                continue;
            }

            $menu = [];
            $label = \Yii::$app->privilege->getLabel($name);

            foreach($value as $level)
            {
                $menu = array_merge($menu,\Yii::$app->privilege->getMenu($name,$level));
            }

            echo $this->render('tab/toggle',[
                'prefix' => $name,
                'label' => \Yii::$app->privilege->getLabel($name),
                'menu' => $menu
            ]);
        endforeach;
    ?>
</ul>

