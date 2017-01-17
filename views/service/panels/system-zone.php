<div class="content">
    <ul class="grid list-group">
        <li class="list-group-item add-row">添加区域</li>
    </ul>
</div>

<script>

    defines['systemZone'] = 'script/system/zone.js';

</script>

<div class="modal fade" id="zone-input-modal">
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
                        <label for="">区域名</label>
                        <input type="text" class="form-control" required minlength="3">
                    </div>

                    <div class="form-group">
                        <button type="button" class="btn btn-primary submit"></button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="zone-delete-modal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title"></h4>
            </div>

            <div class="modal-body">
                <h4 id="zone-delete-tips">!!删除区域后相关的报修记录将一并删除!!</h4>
                <button type="button" class="btn btn-primary">删除</button>
            </div>

        </div>
    </div>
</div>

<div class="modal fade" id="zone-event-modal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title"></h4>
            </div>

            <div class="modal-body">
                <div class="event">
                    <div class="in">
                        <h5>该区域响应以下事件</h5>
                        <ul></ul>
                    </div>

                    <div class="not-in">
                        <h5>以下事件可以添加到该区域</h5>
                        <ul>
                            
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>