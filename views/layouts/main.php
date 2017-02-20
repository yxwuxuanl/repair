<?php

/**
 *@var $content string
 * @var $this \yii\web\View;
*/

use yii\helpers\Html;

\app\assets\ServiceAsset::register($this);

?>

<?php
    $this->beginPage();
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <?= Html::csrfMetaTags() ?>
        <title>Repair System</title>
        <?php
            $this->head();
        ?>
    </head>

    <script>
        var defines = {};
    </script>

    <?php
        $this->beginBody();
    ?>

    <body>

    <?= $content ?>

    <div class="modal fade" id="alert">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title"></h4>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default btn-block" data-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
    </body>

    <?php
        $this->endBody();
    ?>

</html>

<?php
    $this->endPage();
?>