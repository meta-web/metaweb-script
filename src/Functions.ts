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
 * Interface for parser function definition
 */
export interface IFunctionDefinition {
	/**
	 * Transpiler function
	 *
	 * @param name Function name
	 * @param args Arguments
	 */
	renderer: (name: string, args: Array<string>) => string,
	
	/** Min required function argument count **/
	minArgs: number,
	
	/** Max allowed function argument count **/
	maxArgs: number
}

/**
 * Interface for registered function list
 */
export interface IFunctionList {
	[ K: string ]: IFunctionDefinition
}

/**
 * Default function transpiler
 *
 * Transpiles META Script function directly into a native JS function
 *
 * @param fnName Function name
 * @param minArgs Minimum required argument count
 * @param maxArgs Maximum allowed argument count
 */
export function TranspiledFunction(fnName: string, minArgs: number, maxArgs: number): IFunctionDefinition {

	return {
		renderer: (name: string, args: Array<string>) => { return fnName + "(" + args.join(",") + ")" },
		minArgs: minArgs,
		maxArgs: maxArgs
	}

}

/**
 * String-based function transpiler
 *
 * Transpiles META Script function into a native JS function and encapulates value into String() object
 *
 * @param fnName Function name
 * @param minArgs Minimum required argument count
 * @param maxArgs Maximum allowed argument count
 */
export function TranspiledStringFunction(fnName: string, minArgs: number, maxArgs: number): IFunctionDefinition {

	return {
		renderer: (name: string, args: Array<string>) => { return "String(" + args.shift() + ")." + fnName + "(" + args.join(",") + ")" },
		minArgs: minArgs + 1,
		maxArgs: maxArgs + 1
	}

}

/**
 * Empty function transpiler
 *
 * Transpiles META Script function that checks if value is empty
 */
export function EmptyFunction(): IFunctionDefinition {

	return {
		renderer: (name: string, args: Array<string>) => { return '(' + args[0] + '===undefined||' + args[0] + '===null||' + args[0] + '===false||' + args[0] + ' ===""?true:false)' },
		minArgs: 1,
		maxArgs: 1
	}

}

/**
 * Empty function transpiler
 *
 * Transpiles META Script function that checks if value is defined
 */
export function DefinedFunction(): IFunctionDefinition {

	return {
		renderer: (name: string, args: Array<string>) => { return '(' + args[0] + '!==undefined&&' + args[0] + '!==null?true:false)' },
		minArgs: 1,
		maxArgs: 1
	}

}