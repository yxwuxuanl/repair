<?php
    use app\models\Zone;
    use yii\widgets\ActiveForm;

    $model = new Zone();
?>    

    <div class="content"></div>

    <div class="row">
        <div class="col-md-6 col-md-push-6">  
            <span data-zid="0000">
                <span class="glyphicon glyphicon-plus add-zone" id="zone-add-span"></span>
            </span>
        </div>
    </div>

    <div class="modal fade " id="zone-modal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                    <h4 class="modal-title"></h4>
                </div>

                <div class="modal-body">

                    <ul class="nav nav-tabs" role="tablist">
                        <li role="presentation"><a href="#zone-rename-panel" >重命名</a></li>
                        <li role="presentation"><a href="#zone-delete-panel" id="zone-delete-a">删除区域</a></li>
                        <li role="presentation"><a href="#zone-add-panel">添加子区域</a></li>
                    </ul>

                    <br>

                    <div role="tabpanel" class="tab-pane fade" id="zone-rename-panel" aria-labelledby="profile-tab">
                        <?php
                            $form = ActiveForm::begin(['options' => ['name' => 'rename']]);
                        ?>

                        <?= $form->field($model,'zone_name')->label() ?>
                        
                        <button class="btn btn-primary">重命名</button>

                        <?php
                            ActiveForm::end()
                        ?>
                    </div>

                    <div role="tabpanel" class="tab-pane fade" id="zone-delete-panel" aria-labelledby="profile-tab">
                        <div class="alert alert-warning" role="alert">删除区域将一并删除相对应的报修记录!!!</div>
                        <button class="btn btn-primary"  id="zone-delete-button"></button>
                    </div>

                    <div role="tabpanel" class="tab-pane fade" id="zone-add-panel" aria-labelledby="profile-tab">
                        <?php
                            $form = ActiveForm::begin(['options' => ['name' => 'add']]);
                        ?>

                        <?= $form->field($model,'zone_name')->label() ?>
                        
                        <button class="btn btn-primary">添加</button>

                        <?php
                            ActiveForm::end()
                        ?>

                    </div>
                </div>
            </div>
        </div>
    </div>
