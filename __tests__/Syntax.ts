import 'mocha';
import { expect } from 'chai';

import {ModelMockup} from '../src/ModelMockup';
import {IScript, Compiler} from '../src/Compiler';
import {helpers} from '../src/Helpers';

describe("Syntax", () => {

		let model = new ModelMockup({
			_: {
				single: { $: 'value' },
				multi: {
					'@valid': false,
					'@ready': false,
					'@singleAttr': true,
					'@nestedAttr': {
						_: {
							'test': 'TEST'
						}
					},
					_: {
						hello: { $: 'HELLO' , '@valid': true, '@ready': true },
						hi: { $: 'HI' },
						record: {
							'@attr': 'ATTR',
							$: {
								name: 'John',
								truth: 42
							}
						}
					}
				}
			}
		});

		let exec = (script: IScript) => {

			return script.executor.call(null, model, { 'scope': ['multi'], 'record': ['multi', 'record'] } , helpers);

		};

		let compiler = new Compiler();

		//---------------------------

		describe("Constants", () => {

			it('numeric', () => {

				let script = compiler.compileScript('1');
				expect( exec(script) ).to.be.equal(1);

			});

			it('numeric floating point', () => {

				let script = compiler.compileScript('3.141');
				expect( exec(script) ).to.be.equal(3.141);

			});

			it('negative numeric floating point', () => {

				let script = compiler.compileScript('-3.141');
				expect( exec(script) ).to.be.equal(-3.141);

			});

			it('string w/ double quotes', () => {

				let script = compiler.compileScript('"hello"');
				expect( exec(script) ).to.be.equal('hello');

			});

			it('string w/ single quotes', () => {

				let script = compiler.compileScript("'hello'");
				expect( exec(script) ).to.be.equal('hello');

			});


			it('true / false', () => {

				let script;

				script = compiler.compileScript("true");
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript("TRUE");
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript("false");
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript("FALSE");
				expect( exec(script) ).to.be.equal(false);

			});

			it('null', () => {

				let script;

				script = compiler.compileScript("null");
				expect( exec(script) ).to.be.null;

				script = compiler.compileScript("NULL");
				expect( exec(script) ).to.be.null;

			});


		});

		describe("Operators", () => {

			it('Arithmetics (+, -, *, /, %, brackets)', () => {

				let script = compiler.compileScript('(((1 + 1) * 4) / 2) % 3');
				expect( exec(script) ).to.be.equal(1);

			});

			it('Comparison (>, >=, <, <=, ==, !=)', () => {

				let script;

				script = compiler.compileScript('1 == 1');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('1 != 1');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('1 != 2');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('1 > 0');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('1 > 1');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('1 >= 1');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('1 >= 2');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('1 < 2');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('1 < 0');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('1 <= 1');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('1 <= 0');
				expect( exec(script) ).to.be.equal(false);

			});

			it('Logic (&&, ||, !, and, or, not)', () => {

				let script;

				script = compiler.compileScript('! true');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('! false');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('true && true');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('true && false');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('false && false');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('true || false');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('true || true');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('false || false');
				expect( exec(script) ).to.be.equal(false);

				//---

				script = compiler.compileScript('not true');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('NOT false');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('true AND true');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('true and false');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('false AND false');
				expect( exec(script) ).to.be.equal(false);

				script = compiler.compileScript('true OR false');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('true or true');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('false OR false');
				expect( exec(script) ).to.be.equal(false);

			});

			it('String (~)', () => {

				let script;

				script = compiler.compileScript('"hello" ~ "world"');
				expect( exec(script) ).to.be.equal("helloworld");

			});

		});

		describe("Functions", () => {

			it('Generic', () => {

				let script = compiler.compileScript('max(1, 2)');
				expect( exec(script) ).to.be.equal(2);

			});

			it('MIN', () => {

				let script = compiler.compileScript('min(1, 2)');
				expect( exec(script) ).to.be.equal(1);

			});

			it('MAX', () => {

				let script = compiler.compileScript('max(1, 2, 3)');
				expect( exec(script) ).to.be.equal(3);

			});

			it('ABS', () => {

				let script = compiler.compileScript('abs(-1)');
				expect( exec(script) ).to.be.equal(1);

			});

			it('SQRT', () => {

				let script = compiler.compileScript('sqrt(4)');
				expect( exec(script) ).to.be.equal(2);

			});

			it('POW', () => {

				let script = compiler.compileScript('pow(2, 2)');
				expect( exec(script) ).to.be.equal(4);

			});

			it('NaN', () => {

				let script;

				script = compiler.compileScript('nan(0/0)');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('nan(10)');
				expect( exec(script) ).to.be.equal(false);

			});

			it('SUBSTR', () => {

				let script = compiler.compileScript('substr("test", 1, 2)');
				expect( exec(script) ).to.be.equal('es');

			});

			it('STRPOS', () => {

				let script = compiler.compileScript('strpos("test", "st")');
				expect( exec(script) ).to.be.equal(2);

			});

			it('RSTRPOS', () => {

				let script = compiler.compileScript('rstrpos("test", "t")');
				expect( exec(script) ).to.be.equal(3);

			});

			it('UPPERCASE', () => {

				let script = compiler.compileScript('uppercase("tEsT")');
				expect( exec(script) ).to.be.equal('TEST');

			});

			it('LOWERCASE', () => {

				let script = compiler.compileScript('lowercase("tEsT")');
				expect( exec(script) ).to.be.equal('test');

			});

			it('EMPTY', () => {

				let script;

				script = compiler.compileScript('empty("")');
				expect( exec(script) ).to.be.equal(true);

				script = compiler.compileScript('empty("test")');
				expect( exec(script) ).to.be.equal(false);

			});

		});

		describe("Conditions", () => {

			it('IF should return proper values', () => {

				let script;

				script = compiler.compileScript('if(true, 1, -1)');
				expect( exec(script) ).to.be.equal(1);

				script = compiler.compileScript('if(false, 1, -1)');
				expect( exec(script) ).to.be.equal(-1);

			});

			it('IF should throw if non 3 arguments', () => {

				expect(() => {
					compiler.compileScript('if(true)')
				}).to.throw;
				
				expect(() => {
					compiler.compileScript('if(true, 1)')
				}).to.throw;

				expect(() => {
					compiler.compileScript('if(true, 1, 1, 1)')
				}).to.throw;

			});

		});

		describe("Properties & Attributes", () => {

			it('Single-level local property value', () => {

				let script = compiler.compileScript('hello');
				expect( exec(script) ).to.be.equal('HELLO');

			});

			it('Single-level root property value', () => {

				let script = compiler.compileScript('$single');
				expect( exec(script) ).to.be.equal('value');

			});

			it('Multi-level root property value', () => {

				let script = compiler.compileScript('$multi.hi');
				expect( exec(script) ).to.be.equal('HI');

			});

			it('Single-level local attribute value', () => {

				let script = compiler.compileScript('@singleAttr');
				expect( exec(script) ).to.be.equal(true);

			});

			it('Single-level root attribute value', () => {

				let script = compiler.compileScript('$multi@singleAttr');
				expect( exec(script) ).to.be.equal(true);

			});

			it('Multi-level root attribute value', () => {

				let script = compiler.compileScript('$multi@nestedAttr.test');
				expect( exec(script) ).to.be.equal('TEST');

			});

			it('Multi-prop single-level attribute value', () => {

				let script = compiler.compileScript('$multi.hello@valid');
				expect( exec(script) ).to.be.equal(true);

			});

			it('Placeholder property value', () => {

				let script = compiler.compileScript('#record');
				expect( exec(script) ).to.deep.equal({ name: 'John', truth: 42 });

			});

			it('Placeholder attribute value', () => {

				let script = compiler.compileScript('#record@attr');
				expect( exec(script) ).to.be.equal('ATTR');

			});

			it('Composed object property value []', () => {

				let script = compiler.compileScript('#record["name"]');
				expect( exec(script) ).to.be.equal('John');

			});

		});

		it('Should ignore whitespaces and new lines', () => {

			let script = compiler.compileScript('1+\n2');
			expect( exec(script) ).to.be.equal(3);

		});

		it('Complex expression', () => {

			let script = compiler.compileScript('uppercase( if(@singleAttr, $multi.hello, hi) ) ~ " " ~ IF(#record.truth == 42 OR hello@valid, "the TRUTH", "the DOOM") ~ lowercase(" with RADIUS ") ~ (2 * 3.141 * pow(record["truth"], 2))');
			expect( exec(script) ).to.be.equal('HELLO the TRUTH with radius 11081.448');

		});

});