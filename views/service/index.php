<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 上午8:55
 */

function panel($id = null,$action = null)
{
    static $panels = [];

    if($id)
    {
        $panels[$id][] = $action;
    }else{
        return $panels;
    }
}

?>

<div class="container">
    <div class="col-md-10 col-md-push-1">

    <?= $this->render('/template/tab',['privilege' => $pl]) ?>
    <?= $this->render('/template/panel',['panels' => panel()]) ?>

    </div>

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
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

</div>