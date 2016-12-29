<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/12/29
 * Time: 下午7:56
 */

use app\controllers\PrivilegeController;

$privilege = \Yii::$app->getSession()->get('Privilege');

?>

<ul id="nav" class="nav nav-tabs" role="tablist">
	<?php
	foreach($privilege as $name => $value):

		if(empty($value))
		{
			continue;
		}

		$panels = [];
		$label = PrivilegeController::getLabel($name);

		foreach($value as $level)
		{
			$panels = array_merge($panels,PrivilegeController::getPanels($name,$level));
		}

		echo $this->render('navlist',[
			'prefix' => $name,
			'label' => $label,
			'panels' => $panels
		]);
		
	endforeach;
	?>
</ul>

