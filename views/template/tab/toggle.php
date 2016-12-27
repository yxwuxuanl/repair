<li role="presentation" class="dropdown">

    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
        <?= $label ?>
        <span class="caret"></span>
    </a>

    <ul class="dropdown-menu" role="menu">

        <?php
            foreach($menu as $value) :
                panel($prefix,$value[1]);
        ?>

            <li>
                <a href="#<?= $prefix . '-' . $value[1] ?>-panel" id="<?= $prefix . '-' . $value[1]  ?>-tab" tabindex="-1" data-toggle="tab">
                    <?= $value[0] ?>
                </a>
            </li>

        <?php
            endforeach;
        ?>

    </ul>
</li>