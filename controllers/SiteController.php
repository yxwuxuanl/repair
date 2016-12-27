<?php

namespace app\controllers;

use app\behaviors\NoCsrf;
use app\models\User;
use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\filters\VerbFilter;
use app\models\LoginForm;
use app\models\ContactForm;
use yii\web\Cookie;
use yii\web\CookieCollection;
use app\models\Zone;

class SiteController extends Controller
{
    public function actionIndex()
    {
        return $this->redirect('service');
    }
}
