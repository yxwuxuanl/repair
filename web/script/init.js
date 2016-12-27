function init()
{

	C($service);
	return;
	C($service.parseArgs([12],{
		'name' : [
			function(value)
			{
				return typeof value == 'string';
			},
			'anonymons'
		],
		'age' : [
			function(value)
			{
				return !isNaN(value);
			},
			20
		],
		'sex' : function(value)
		{
			return value == 'boy' || value == 'gril';
		}
	}))
}