(function ($rs) {
    var
        allTask = {
            'init': function () {
                var
                    $select = this.$panel.find('select');

                this.watch($select);
                $select.change();
            },
            'watch': function ($select)
            {
                $select.change(function () {
                    allTask.render($(this));
                })
            },
            'render': function ($select)
            {
                var
                    type = $select.val(),
                    $mount, url, $ul, li;
                
                if (type == 2)
                {
                    $mount = this.$panel.find('.complete');
                    url = 'task/get-group-complete';
                } else {
                    $mount = this.$panel.find('.underway');
                    url = 'task/get-group-underway';
                }

                $rs.ajax(url).done(function (response) {
                    var
                        $ul = $mount.find('ul'),
                        data = response.content,
                        len = data.length,
                        li;
                    
                    if (len < 1)
                    {
                        $ul.find('.content').remove();
                        return $mount.show();
                    }    

                    $ul.find('.empty').remove();
                    li = $ul.html();
                    $ul.html('');

                    for (var i = 0; i < len; i++)
                    {
                        var
                            current = data[i],
                            li_ = li, $li;
                        
                        for (key in current)
                        {   
                            li_ = li_.replace('{' + key + '}', current[key], li_);
                        }    

                        $li = $(li_);
                        $li.data('tid', current[key]['task_id']);
                        $ul.append($li);
                    }

                    $mount.append($ul);
                    $mount.show();
                });
            }    
        };
    
    $rs.addModule('task-all', allTask);
})($rs);