/*
 * MetaWEB
 *
 * META Script implementation
 *
 * @package metaweb-script
 * @copyright 2017 Jiri Hybek <jiri@hybek.cz>
 * @license MIT
 */

import {IFunctionList, IFunctionDefinition} from './Functions';
import * as Functions from './Functions';

import {Parse, ParseInterpolation, ParseVariable, ParsePropertyRef} from './Parser';
import {InvalidVariableError} from './Errors';

/**
 * Converts bindings hashmap to an array
 *
 * @param bindings Bindings hashmap
 */
export function normalizeBindings(bindings: { [K: string]: number }){

	let res = [];

	for(let i in bindings)
		res.push(i);

	return res;

}

/**
 * Compiled script interface
 */
export interface IScript {

	/** Script source code **/
	source: string;

	/** Transpiled function instance **/
	executor: Function;

	/** Array of variable bindings **/
	bindings: Array<Array<string>>;

	/** Transpiled javascript code for debugging **/
	js: string;

	/** ID of script origin - for debugging purpose, can be a filename */
	origin?: string;
}

/**
 * Compiler instance class
 *
 * Provides interface for parsing and transpiling META Script into JavaScript
 */
export class Compiler {

	/** List of registered functions **/
	protected functions: IFunctionList = {};

	/**
	 * Compiler constructor
	 *
	 * Provides basic setup
	 */
	public constructor(){

		//Register basic math functions
		this.registerFunction("min", Functions.TranspiledFunction("Math.min", 1, 9999));
		this.registerFunction("max", Functions.TranspiledFunction("Math.max", 1, 9999));
		this.registerFunction("abs", Functions.TranspiledFunction("Math.abs", 1, 1));
		this.registerFunction("sqrt", Functions.TranspiledFunction("Math.sqrt", 1, 1));
		this.registerFunction("pow", Functions.TranspiledFunction("Math.pow", 2, 2));
		this.registerFunction("nan", Functions.TranspiledFunction("isNaN", 1, 1));
		this.registerFunction("finite", Functions.TranspiledFunction("isFinite", 1, 1));

		//Register string manipulation functions
		this.registerFunction("substr", Functions.TranspiledStringFunction("substr", 1, 2));
		this.registerFunction("strpos", Functions.TranspiledStringFunction("indexOf", 1, 1));
		this.registerFunction("rstrpos", Functions.TranspiledStringFunction("lastIndexOf", 1, 1));
		this.registerFunction("uppercase", Functions.TranspiledStringFunction("toUpperCase", 0, 0));
		this.registerFunction("lowercase", Functions.TranspiledStringFunction("toLowerCase", 0, 0));

		//Register other functions
		this.registerFunction("empty", Functions.EmptyFunction());
		this.registerFunction("defined", Functions.DefinedFunction());

	}

	/**
	 * Registers custom function
	 *
	 * @param name Function name
	 * @param definition Function transpiler definition
	 */
	public registerFunction(name: string, definition: IFunctionDefinition){

		this.functions[name] = definition;

	}

	/**
	 * Returns if function is registered
	 *
	 * @param name Function name
	 */
	public hasFunction(name: string){

		return ( this.functions[name] ? true : false );

	}

	/**
	 * Compiles META Script and returns IScript instance
	 *
	 * @param source Script source code
	 */
	public compileScript(source: string): IScript {

		let parsed = Parse(this.functions, source);

		return {
			source: source,
			executor: new Function("r,p", parsed.source),
			bindings: normalizeBindings(parsed.bindings),
			js: parsed.source
		}

	}

	/**
	 * Compiles META Script string interpolation and returns IScript instance
	 *
	 * @param source Source string with interpolation
	 */
	public compileInterpolation(source: string): IScript {

		let parsed = ParseInterpolation(this.functions, source);
		
		return {
			source: source,
			executor: new Function("r,p", parsed.source),
			bindings: normalizeBindings(parsed.bindings),
			js: parsed.source
		}

	}

	/**
	 * Compiles META Script property reference and returns IScript instance
	 *
	 * @param source Reference expression source code
	 */
	public compilePropertyRef(source: string): IScript {

		let parsed = ParsePropertyRef(source);

		return {
			source: source,
			executor: new Function("r,p", parsed.source),
			bindings: normalizeBindings(parsed.bindings),
			js: parsed.source
		}

	}

	/**
	 * Parses META Script variable
	 *
	 * @param exp Expression source code
	 * @param id Internal variable ID
	 */
	public parseVariable(exp: string, id: string){

		let check = new RegExp("(#)?((@)?[a-zA-Z_]+([a-zA-Z0-9_]+)?(\\.[a-zA-Z_]+([a-zA-Z0-9_]+)?)*(\\@[a-zA-Z_]([a-zA-Z0-9_]+)?)?|(\\$[a-zA-Z_]([a-zA-Z0-9_]+)?))");

		if(!check.test(exp))
			throw new InvalidVariableError(exp);

		let parsed = ParseVariable(exp, id);

		parsed.bindings = [ parsed.bindings ];

		return parsed;

	}

}