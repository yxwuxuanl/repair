<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/3/29
 * Time: 下午11:58
 */

namespace app\models;

use yii\db\ActiveRecord;

class TaskCount extends ActiveRecord
{
    public static function tableName()
    {
        return 'task_count';
    }

    public static function getById($id,$type,$limit = 3)
    {
        return parent::find()
            ->where('`id` = :id')
            ->andWhere('`type` = :type')
            ->andWhere('`time` BETWEEN concat(date_format(now(),\'%Y\'),\'.\',week(now())) and concat(date_format(now(),\'%Y\'),\'.\',week(now()) + :limit)')
            ->params([':limit' => $limit,':id' => $id,':type' => $type])
            ->asArray()->one();
    }

    public static function getSum($id,$time = null)
    {
        $ar = parent::find()
            ->where('id = :id')
            ->select(['sum(underway) as underway','sum(complete) as complete','format(sum(hours)/sum(complete),2) as efficient'])
            ->addParams([':id' => $id]);

        if($time)
        {
            if(is_array($time))
            {
                $ar->andWhere(['between','time',$time[0],$time[1]]);
            }else{
                $ar->andWhere('time = :time')
                    ->addParams([':time' => $time]);
            }
        }

        return $ar->asArray()->one();
    }

    public static function getEfficient($id,$time = null)
    {

    }
}