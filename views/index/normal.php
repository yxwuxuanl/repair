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
	}
</script>

<h3 class="account-name">
	<?= $accountName ?>
	<span> [<?= $groupName ?>]</span>

    <?php
        if($isGm):
    ?>

    <span> [部门管理员] </span>

    <?php
        endif;
    ?>

</h3>

<div>
	<p class="underway">还有 <span class="number"><?= $underway  ?></span> 个进行中的任务</p>

    <?php
        if($taskMode <= 2):
    ?>

	<p>组任务池还有 <span class="number"><?= $groupPool ?></span> 个任务</p>
    
    <?php
        endif;
    ?>



	<p>一共完成了 <span class="number"><?= $complete ?></span> 个任务</p>
</div>