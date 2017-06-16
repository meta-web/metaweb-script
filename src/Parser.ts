/*
 * MetaWEB
 *
 * META Script implementation
 *
 * @package metaweb-script
 * @copyright 2017 Jiri Hybek <jiri@hybek.cz>
 * @license MIT
 */
import {ParseError} from './Errors';
import {IFunctionList} from './Functions';

/**
 * Parses variable expression
 *
 * @param exp Expression
 * @param id Internal variable ID
 * @param propertyPointer If expression should be pointer to property
 */
export function ParseVariable(exp: string, id: string, propertyPointer: boolean = false){

	let parts = exp.split("@");
	let path = ( parts[0] != "" ? parts[0].split(".") : [] );

	let pathArgs = [];
	let placeholders = {};

	if(path.length > 0 && path[0].substr(0, 1) == "$")
		path[0] = path[0].substr(1);		
	else if(path.length === 0 || path[0].substr(0, 1) != "#")
		path.unshift("#scope")

	for(let i = 0; i < path.length; i++){
		
		if(path[i].substr(0, 1) == "#"){

			let phName = path[i].substr(1);
			pathArgs.push('p["' + phName + '"]');

			placeholders[phName] = true;

		} else if(path[i] !== "") {
			
			pathArgs.push('"' + path[i] + '"');

		}

	}

	let pathStr = pathArgs.join(',');

	let varSrc;

	if(propertyPointer){

		varSrc = 'var v' + id + '=m.ref(h.np([' + pathStr + ']));';

	} else if(parts[1] == "valid"){

		varSrc = 'var v' + id + '=m.isValid(h.np([' + pathStr + ']));';

	} else if(parts[1] == "ready"){

		varSrc = 'var v' + id + '=m.isReady(h.np([' + pathStr + ']));';

	} else if(parts[1]){

		let attrParts = parts[1].split(".");
		let attrPath = [];
		for(let i = 0; i < attrParts.length; i++) attrPath.push('"' + attrParts[i] + '"');

		varSrc = 'var v' + id + '=m.attr(h.np([' + pathStr + ']),[' + attrPath.join(",") + ']);';

	} else {

		varSrc = 'var v' + id + '=m.get(h.np([' + pathStr + ']));';

	}

	return {
		name: 'v' + id,
		source: varSrc,
		bindings: path,
		placeholders: placeholders
	}

}

/**
 * Parse META script and transpile it into JavaScript
 *
 * @param functions Available functions
 * @param script Script source code
 * @param returnsString If expression result should be trated as a string
 */
export function Parse(functions: IFunctionList, script: string, returnsString: boolean = false){

	let output = "";

	let mode = 0;
	let inFn: any = null;
	let argIndex = 0;
	let args = [];	
	let refCursor = 0;

	let stack: Array<any> = [];
	
	let index = 0;
	let token: string = null;
	let buffer = "";

	let variableList: Array<string> = [];
	let variableMap: { [ K: string ]: string } = {};
	let variableDefinitions: Array<string> = [];
	
	let variableBindings: { [ K: string ]: Array<string> } = {};
	let placeholders: { [ K: string ]: boolean } = {} ;

	let functionsPatternList = [];

	for(let name in functions){
		functionsPatternList.push(name.toLowerCase());
		functionsPatternList.push(name.toUpperCase());
	}

	let functionsPattern = functionsPatternList.join("|");

	//----

	let throwError = function(message: string){

		throw new ParseError(script, index, message);

	};

	let nest = function(){

		stack.push({ m: mode, a: argIndex, f: inFn, n: args, r: refCursor, b: buffer });

	};

	let unest = function(){

		if(stack.length === 0) throwError("Unclosed scope");

		let state = stack.pop();

		mode = state.m;
		inFn = state.f;
		argIndex = state.a;
		args = state.n;
		refCursor = state.r;

	};

	let eat = function(pattern: string){

		let haystack = script.substr(index);
		let xp = new RegExp("^" + pattern);
		let match = xp.exec(haystack);

		if(match){
			index+= String(match[0]).length;
			token = match[0];
			return true;
		}

		return false;

	};

	let flushBuffer = function(){

		output+= buffer;
		buffer = "";

	};

	let clearBuffer = function(){

		buffer = "";

	};

	while(index < script.length){

		//Escaping
		if(eat("\\\\")){

			if(mode !== 3) throwError("Unexpected character escape");

			eat(".");
			buffer+= token;
			continue;

		}

		//Comment open
		if(eat("\\/\\*")){

			nest();
			mode = -1;
			continue;

		}

		//Comment close
		if(mode === -1 && eat("\\*\\/")){

			unest();
			continue;

		}

		//Comment contents
		if(mode === -1){
			eat(".");
			continue;
		}

		//Quotes
		if(eat("(\\'|\\\")")){

			if(mode === 3){
				buffer+= '"';
				mode = 2;
				continue;
			}

			if(mode >= 2) throwError("Unexpected operand");

			buffer+= '"';
			mode = 3;
			continue;

		}

		if(mode === 3){

			eat(".");
			buffer+= token;
			continue;

		}

		//If condition
		if(eat("(if|IF)\\(")){

			if(mode >= 2) throwError("Unexpected conditional operand");
			
			mode = 2;

			nest();

			buffer+= "(";
			mode = 0;
			argIndex = 0;
			inFn = "if";

			continue;

		}

		//Custom functions
		if(eat("[a-zA-Z_]+[a-zA-Z0-9_]*\\(")){

			if(mode >= 2) throwError("Unexpected function");
			
			mode = 2;

			let fnName = token.substr(0, token.length - 1);

			if(!functions[fnName])
				throwError("Undefined function '" + fnName + "'");

			flushBuffer();
			nest();

			mode = 0;
			inFn = fnName.toLowerCase()
			argIndex = 0;
			args = [];

			continue;

		}

		if(eat(",")){

			if(inFn === null) throwError("Not in function scope");

			if(inFn == "if" && argIndex === 0)
				buffer+= "?";
			else if(inFn == "if" && argIndex === 1)
				buffer+= ":";
			else if(inFn == "if" && argIndex >= 2)
				throwError("Too much arguments");
			else {
				args.push(buffer)
				clearBuffer();
			}

			mode = 1;
			argIndex++;
			continue;

		}

		if(eat("\\(")){

			if(mode >= 2) throwError("Unexpected operand");

			nest();
			buffer+= "(";
			mode = 0;
			argIndex = 0;
			inFn = null;
			continue;

		}

		if(eat("\\)")){

			if(stack.length === 0) throwError("Not in scope");

			if(inFn == "if" && argIndex <= 1)
				throwError("Too few arguments");

			if(inFn && inFn != "if"){

				if(buffer != "") args.push(buffer);
				clearBuffer();

				let fnDef = functions[inFn];

				if(args.length < fnDef.minArgs)
					throwError("Function '" + inFn + "' requires at least " + fnDef.minArgs + " arguments");

				if(args.length > fnDef.maxArgs)
					throwError("Function '" + inFn + "' accepts only " + fnDef.maxArgs + " arguments");

				buffer = fnDef.renderer.call(null, inFn, args);

			} else {

				buffer+=")";

			}

			unest();
			//flushBuffer();

			mode = 2;
			continue;
			
		}

		if(eat("\\[")){

			if(mode < 2) throwError("Unexpected square bracket");

			mode = 3;

			buffer = buffer.substr(0, refCursor) + "(" + buffer.substr(refCursor) + "||{})[";

			nest();
			mode = 0;
			argIndex = 0;
			inFn = null;
			continue;

		}

		if(eat("\\]")){

			if(stack.length === 0) throwError("Not in square scope");

			unest();

			if(mode !== 3) throwError("Not in square scope");

			buffer+="]";
			mode = 2;
			continue;
			
		}

		//Numeric operand
		if(eat("(-)?[0-9]+(\\.[0-9]+)?")){
			
			if(mode >= 2) throwError("Unexpected operand");

			buffer+= token;
			mode = 2;
			continue;

		}

		//Logical operators
		if(eat("(and|AND|or|OR|not|NOT)")){
			
			if(mode == 1) throwError("Unexpected operator");

			if(token.toLowerCase() == "and")
				buffer+= "&&";
			if(token.toLowerCase() == "or")
				buffer+= "||";
			if(token.toLowerCase() == "not")
				buffer+= "!";

			mode = 1;
			continue;

		}

		//Constants (TRUE, FALSE, NULL)
		if(eat("(TRUE|true|FALSE|false|NULL|null)")){
			
			if(mode >= 2) throwError("Unexpected operand '" + token + "'");

			buffer+= token.toLowerCase();

			mode = 2;
			continue;

		}

		//Variable operand
		if(eat("(\\$|#)?([a-zA-Z_]+([a-zA-Z0-9_]+)?(\\.[a-zA-Z0-9_]+)*(@[a-zA-Z_]([a-zA-Z0-9_]+)?(\\.[a-zA-Z0-9_]+)*)?|(@[a-zA-Z_]([a-zA-Z0-9_]+)?(\\.[a-zA-Z0-9_]+)*))")){
			
			if(mode >= 2) throwError("Unexpected operand '" + token + "'");

			if(variableList.indexOf(token) < 0){

				variableList.push(token);

				try {
					
					let _parsedVar = ParseVariable(token, String(variableList.length - 1));

					variableDefinitions.push(_parsedVar.source);
					variableMap[token] = _parsedVar.name;

					let _bindingsHash = _parsedVar.bindings.toString();

					if(!variableBindings[_bindingsHash])
						variableBindings[_bindingsHash] = _parsedVar.bindings;

					for(let i in _parsedVar.placeholders)
						placeholders[i] = true;

				} catch(e){

					throwError(e.toString());

				}

			}

			refCursor = buffer.length;
			buffer+= variableMap[token];

			mode = 2;
			continue;

		}

		//String operator match
		if(eat("(\\~)")){
			
			if(mode == 1) throwError("Unexpected operator '" + token + "'");

			buffer+= "+";
			mode = 1;
			continue;

		}

		//Operator match
		if(eat("(\\!=|\\!|\\<=|\\>=|==|&&|\\|\\||\\+|\\-|\\/|\\*|\\>|\\<|%)")){
			
			if(mode == 1) throwError("Unexpected operator '" + token + "'");

			buffer+= token;
			mode = 1;
			continue;

		}

		if(eat("( |\n|\r)")){
			continue;
		}

	 	throwError("Unexpected token");

	}

	flushBuffer();

	//Placeholder checks
	let placeholderChecks = [];

	for(let name in placeholders)
		placeholderChecks.push('if(!p["' + name + '"]) throw new Error(pe+"' + name + '");');

	if(placeholderChecks.length > 0){
		placeholderChecks.unshift("p=p||{};");
		placeholderChecks.unshift('pe="Path must be provided for placeholder #";');
	}

	//Final code
	let evalCode;

	if(returnsString){

		evalCode = 'var _=' + output + ';return(_||_===0?_:"")';

	} else {

		evalCode = "return " + output + ";"

	}

	return {
		bindings: variableBindings,
		source: placeholderChecks.join("") + variableDefinitions.join("") + evalCode
	}

};

/**
 * Parses META Script string interpolation
 *
 * @param functions Available functions
 * @param str Input string
 */
export function ParseInterpolation(functions: IFunctionList, str: string){

	let matches = str.match(/\#\{[^}]+\}/g);
	let bindings: { [K: string]: Array<string> } = {};

	let matchesMap: { [K: string]: string } = {}; 
	let varDefinitions: Array<string> = [];

	if(matches){

		for(let i = 0; i < matches.length; i++){
			
			if(matchesMap[matches[i]] === undefined){

				let exp = matches[i].substr(2, matches[i].length - 3);
				let parsed = Parse(functions, exp, true);
				
				for(let i in parsed.bindings)
					bindings[i] = parsed.bindings[i];

				let varId = String(varDefinitions.length);

				varDefinitions.push('var w' + varId + '=(function(){' + parsed.source + '})();' );
				matchesMap[matches[i]] = varId;

			}

			str = str.replace(matches[i], '__val__' + matchesMap[matches[i]]);

		}

	}

	//Escape string
	str = str.replace(/\\/g, '\\\\');
	str = str.replace(/"/g, '\\"');

	//Rewrite vars
	str = str.replace(/__val__([0-9])+/g, '"+w$1+"');

	return {
		bindings: bindings,
		source: varDefinitions.join("") + 'return "' + str + '";'
	};

}

/**
 * Parses META Script property reference
 *
 * @param exp Expression
 */
export function ParsePropertyRef(exp: string){

	let check = new RegExp("(\\$|#)?[a-zA-Z_]+([a-zA-Z0-9_]+)?(\\.[a-zA-Z0-9_]+)*(@[a-zA-Z_]([a-zA-Z0-9_]+)?)?");

	if(!check.test(exp))
		throw new Error("Invalid property expression");

	let _var = ParseVariable(exp, "", true);

	//Placeholder checks
	let placeholderChecks = [];

	for(let name in _var.placeholders)
		placeholderChecks.push('if(!placeholders["' + name + '"]) throw new Error("Value for placeholder #' + name + ' must be provided.");');

	if(placeholderChecks.length > 0)
		placeholderChecks.unshift("placeholders=placeholders||{};");

	return {
		bindings: { "_": _var.bindings },
		source: _var.source + 'return ' + _var.name + ';'
	};

}