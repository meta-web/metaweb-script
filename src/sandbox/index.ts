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

let compiler = new Compiler();

let s1 = compiler.compileScript("my.prop@super.attr");
let s2 = compiler.compileInterpolation("Hello #{world.name@valid.x}!");
//let s3 = compiler.compilePropertyRef("hello.world");

console.log(s1);
console.log(s2);
//console.log(s3);