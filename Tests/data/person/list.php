<?php
/*
deliver JSON data for mochaUI tests:

sample GET request:
 list.php?page=1&max=50&order=asc&sort=


(code (c) Ger Hobbelt, ger@hobbelt.com)
*/

function argval($id, $default_value = '')
{
	if (array_key_exists($id, $_GET))
	{
		return $_GET[$id];
	}
	return $default_value;
}
function argval_int($id, $min_value = 0)
{
	$v = intval(argval($id, $min_value));
	if ($v < $min_value)
		return $min_value;
	return $v;
}
function sort_on($fieldset, &$data, $reverse = false)
{
	if (!empty($data) && array_key_exists('data', $data) && !empty($data['data']) && !empty($fieldset))
	{
		$f = explode(',', $fieldset);
		
		$d = $data['data'];
		$idx = array();
		for ($i = 0; $i < count($d); $i++)
		{
			$v = array();
			for ($j = 0; $j < count($f); $j++)
			{
				if (empty($f[$j]) || $f[$j] == '*')
				{
					$v[] = $i; // used to make sure each value-to-be-sorted is unique so that the internal qsort will act as a STABLE SORT
				}
				else if (array_key_exists($f[$j], $d[$i]))
				{
					$v[] = $d[$i][$f[$j]];
				}
				else
				{
					// non-exiting fields also count when input data has arbitrary fields set (or not)
					// so we store these not-having-this-one as NULL parts; the following IMPLODE
					// is done in such a way that it ensures the NULLs don't nuke the sort order in 
					// a lexicographic sort.
					$v[] = '';
				}
			}
			$idx[$i] = implode('\xFF', $v);
		}
		asort($idx);
		if ($reverse)
		{
			$idx = array_reverse($idx, true);
		}
		$o = array();
		foreach($idx as $key => $value)
		{
			$o[] = $d[$key];
		}
		$data['data'] = $o;
	}
}



$data = json_decode(file_get_contents('list.json'), true);

$reverse_order = (strtolower(argval('order')) != 'asc');
$items_per_page = argval_int('max', 1);
$pagenum = argval_int('page', 1);
$sort_on = argval('sort');

if (!empty($sort_on))
{
	sort_on(implode(',' , (array)$sort_on) . ',*', $data, $reverse_order);  // make sure the internal qsort acts as a STABLE SORT by always sorting on INPUT ORDER ('*') at the very last.
}
	
$items_per_page = argval_int('max', 1);
$start_index = ($pagenum - 1) * $items_per_page + 1;
$end_index = $start_index + $items_per_page - 1;
$data_count = 0;
if (!empty($data) && array_key_exists('data', $data) && !empty($data['data']))
{
	$data_count = count($data['data']);
}
if ($data_count < $end_index)
{
	$end_index = $data_count;
}

/* from content.js:  

	sort:			'',			// fields to search by, comma separated list of fields or array of strings.  Will be passed to server end-point.
	dir:			'asc',		// 'asc' ascending, 'desc' descending
	recordsField:	'data',		// 'element' in the json hash that contains the data
	totalField:		'total',	// 'element' in the json hash that contains the total records in the overall set
	pageField:		'page',		// 'element' in the json hash that contains the maximum pages that can be selected
	pageMaxField:	'pageMax',	// 'element' in the json hash that contains the maximum pages that can be selected
	pageSizeField:	'pageSize',	// 'element' in the json hash that contains the size of the page
	firstField:		'first',	// 'element' in the json hash that contains the size of the page
	lastField:		'last',		// 'element' in the json hash that contains the maximum pages that can be selected
*/
$rv = array(
		"page" => $pagenum,
		"pageSize" => $items_per_page,
		"pageMax" => ceil($data_count / $items_per_page),
		"total" => $data_count,
		"first" => $start_index,
		"last" => $end_index,
		"data" => array()
	);
for ($i = $start_index; $i < $end_index; $i++)
{
	$rv['data'][] = $data['data'][$i - 1];
}

header('Cont-type: application/json');

echo json_encode($rv);

?>
