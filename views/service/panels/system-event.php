<script>

    defines['systemEvent'] = 'script/system/event.js';

</script>

<div class="content">
    <ul class="grid list-group">
        <li class="list-group-item add-row">添加事件</li>
    </ul>
</div>

<div class="modal fade" id="event-input-modal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title"></h4>
            </div>

            <div class="modal-body">
                <form role="form">
                    <div class="form-group">
                        <label for="">事件名</label>
                        <input type="text" class="form-control" id="event-name" required minlength="5">
                    </div>

                    <div class="form-group">
                        <button type="button" class="btn btn-primary submit"></button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="event-delete-modal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title"></h4>
            </div>


            <div class="modal-body">
                <h4 id="zone-delete-tips">!!删除事件后相关的报修记录将一并删除!!</h4>
                <button type="button" class="btn btn-primary  delete">删除</button>
            </div>

        </div>
    </div>
</div>