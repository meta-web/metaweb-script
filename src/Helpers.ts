/*
 * MetaWEB
 *
 * META Script implementation
 *
 * @package metaweb-script
 * @copyright 2017 Jiri Hybek <jiri@hybek.cz>
 * @license MIT
 */

/**
 * Expression helpers
 */
export let helpers = {

	/**
	 * Merge nested properties
	 *
	 * Flattens an property path array
	 *
	 * @param arr Property path array (of arrays)
	 */
	np: (arr: Array<any>) => {

		let res = [];

		for(let i = 0; i < arr.length; i++)
			if(arr[i] instanceof Array)
				res = res.concat(helpers.np(arr[i]));
			else if(arr[i] !== "")
				res.push(arr[i]);

		return res;

	}

}

export default helpers;