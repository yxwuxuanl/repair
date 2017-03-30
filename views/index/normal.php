<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/3/2
 * Time: 上午8:38
 */
?>

<script>
	window.onload = function()
	{
        var
            $panel = $('#index-panel');

		$panel.find('.underway').click(function(){
			$('#task-assign-tab').click();
		});

        $panel.find('.week-done,.all-done').click(function(){
            $('#task-complete-tab').click();
        });
	}
</script>

<h3 class="account-name">
	<?= $accountName ?>

	<span> [<?= $groupName ?>]</span>

    <?php
        if($isGa):
    ?>

    <span> [部门管理员] </span>

    <?php
        endif;
    ?>

</h3>

<div>
    <div class="part">
        <h5>个人任务概况</h5>

        <p class="underway">还有 <?= $underway ?> 个进行中的任务</p>
        <p class="week-done">本周完成了 <?= $weekDone ?> 个任务<br/><span>平均 <?= $weekEfficient ?>小时 / 个任务</span></p>
        <p class="all-done">总共完成了 <?= $allDone ?> 个任务 <br/><span>平均<?= $efficient ?>小时 / 个任务</span></p>

    </div>

</div>