/*
 * MetaWEB
 *
 * META Script implementation
 *
 * @package metaweb-script
 * @copyright 2017 Jiri Hybek <jiri@hybek.cz>
 * @license MIT
 */

import {Compiler} from '../Compiler';
import {ModelMockup} from '../ModelMockup';
import {ParseVariable, Parse, ParseInterpolation, ParsePropertyRef} from '../Parser';

let model = new ModelMockup({
	"$valid": true,
	"child": "value"
});

//let compiler = new Compiler();
//let s1 = compiler.compileScript("my.prop@super.attr");
//let s2 = compiler.compileInterpolation("Hello #{world.name@valid.x}!");
//let s3 = compiler.compilePropertyRef("hello.world");

//console.log(s1);
//console.log(s2);
//console.log(s3);

console.log(ParseVariable("local.var", "1", false));
console.log(ParseVariable("local$attr", "1", false));
console.log(ParseVariable("#root.var", "1", false));
console.log(ParseVariable("@record.var", "1", false));
console.log(ParseVariable("$directAttr", "1", false));
console.log(ParseVariable("#$directRootAttr", "1", false));
console.log("---");
console.log(ParsePropertyRef("@record.var"));
console.log("---");
console.log(Parse({}, "local.var + local$attr + #root.var + @record.var + @record$valid"));
console.log("---");
console.log(ParseInterpolation({}, "Hello #{local.var} or #{#root.var} or #{@record.var}"));
console.log("---");
console.log(ParseVariable("@record.var.1.name", "1", false));