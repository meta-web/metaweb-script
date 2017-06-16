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
 * Parse error class
 *
 * Thrown when parser encounters an error
 */
export class ParseError extends Error {

	/** Source script **/
	public source: string;

	/** Error position **/
	public index: number;

	/**
	 * Error constructor
	 *
	 * @param script Script source code
	 * @param index Error position
	 * @param message Error message
	 */
	constructor(script: string, index:number, message: string){

		let msg = message + " at '" + script.substr(0, index) + ">>>" + script.substr(index, 1) + "<<<" + script.substr(index + 1) + "'.";

		super(msg);

		this.name = "ParseError";
		this.source = script;

	}

}

/**
 * Parse exception class
 *
 * Thrown when parser encounters an error
 */
export class InvalidVariableError extends Error {

	/** Source script **/
	public source: string;

	/**
	 * Error constructor
	 *
	 * @param script Expression source code
	 */
	constructor(script: string){

		super("Invalid variable expression");

		this.name = "InvalidVariableError";
		this.source = script;

	}

}