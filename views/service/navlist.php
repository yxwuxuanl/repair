<li role="presentation" class="dropdown">

    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
        <?= $label ?>
        <span class="caret"></span>
    </a>

    <ul class="dropdown-menu" role="menu">

        <?php
            foreach($panels as $panel) :    
        ?>

            <li>
                <a href="#<?= $prefix . '-' . $panel[1] ?>-panel" id="<?= $prefix . '-' . $panel[1]  ?>-tab" tabindex="-1" data-toggle="tab">
                    <?= $panel[0] ?>
                </a>
            </li>

        <?php
            panels($prefix,$panel[1]);
            endforeach;
        ?>

    </ul>
</li>