<?php
    app\assets\ValidateAsset::register($this);
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

                <div role="tabpanel" class="tab-pane fade" id="zone-rename-panel" aria-labelledby="profile-tab">

                    <form role="form" id="zone-rename-form" action="rename" class="af">
                        <div class="form-group">
                            <label for="zone-rename-input">区域名</label>
                            <input type="text" class="form-control" name="zone-rename-input" minlength="2" required maxlength="10" id="zone-rename-input">
                        </div>
                        <button class="btn btn-primary submit" type="button">Rename</button>
                    </form>

                </div>

                <div role="tabpanel" class="tab-pane fade" id="zone-delete-panel" aria-labelledby="profile-tab">
                    <div class="alert alert-warning" role="alert">删除区域将一并删除相对应的报修记录!!!</div>
                    <button class="btn btn-primary" id="zone-delete-button"></button>
                </div>

                <div role="tabpanel" class="tab-pane fade" id="zone-add-panel" aria-labelledby="profile-tab">
                    <form role="form" id="zone-add-form" action="add">
                        <div class="form-group">
                            <label for="zone-add-input">区域名</label>
                            <input type="text" class="form-control" id="zone-add-input" minlength="2" required maxlength="10" name="zone-add-input">
                        </div>
                        <button class="btn btn-primary submit">添加</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
