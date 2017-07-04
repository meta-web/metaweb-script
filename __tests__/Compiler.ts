import 'mocha';
import { expect } from 'chai';

import {Compiler} from '../src/Compiler';

describe("Compiler", () => {

	it("should construct", () => {

		let compiler = new Compiler();

	});

	it("should register custom function", () => {

		let compiler = new Compiler();

		compiler.registerFunction('test', {
			minArgs: 1,
			maxArgs: 3,
			renderer: (name: string, args: Array<any>) => {
				return "'" + args.join(",") + "'";
			}
		});

		expect(compiler.hasFunction('test')).to.be.true;

	});

	it("should has default functions registered", () => {

		let compiler = new Compiler();

		expect(compiler.hasFunction('min')).to.be.true;
		expect(compiler.hasFunction('max')).to.be.true;
		expect(compiler.hasFunction('abs')).to.be.true;
		expect(compiler.hasFunction('sqrt')).to.be.true;
		expect(compiler.hasFunction('pow')).to.be.true;
		expect(compiler.hasFunction('nan')).to.be.true;
		expect(compiler.hasFunction('finite')).to.be.true;
		expect(compiler.hasFunction('substr')).to.be.true;
		expect(compiler.hasFunction('strpos')).to.be.true;
		expect(compiler.hasFunction('rstrpos')).to.be.true;
		expect(compiler.hasFunction('uppercase')).to.be.true;
		expect(compiler.hasFunction('lowercase')).to.be.true;
		expect(compiler.hasFunction('empty')).to.be.true;
		expect(compiler.hasFunction('defined')).to.be.true;

	});

	it("#compileScript", () => {

		let compiler = new Compiler();
		let script = compiler.compileScript('uppercase( if($singleAttr, #multi.hello, hi) ) ~ " " ~ IF(@record.truth == 42 OR hello$valid, "the TRUTH", "the DOOM") ~ lowercase(" with RADIUS ") ~ (2 * 3.141 * pow(record["truth"], 2))');

		expect(script.bindings).to.be.instanceof(Array);
		expect(script.source).to.exist;
		expect(script.js).to.exist;
		expect(script.executor).to.be.instanceof(Function);

	});

	it("#compileInterpolation", () => {

		let compiler = new Compiler();
		let script = compiler.compileInterpolation('Helllo #{name}!');

		expect(script.bindings).to.deep.equal(
			[ "{scope}.name" ]
		);

		expect(script.source).to.exist;
		expect(script.js).to.exist;
		expect(script.executor).to.be.instanceof(Function);

	});

	it("#compilePropertyRef", () => {

		let compiler = new Compiler();
		let script = compiler.compilePropertyRef('varName.subName');

		expect(script.bindings).to.deep.equal(
			[ "{scope}.varName.subName" ]
		);

		expect(script.source).to.exist;
		expect(script.js).to.exist;
		expect(script.executor).to.be.instanceof(Function);

	});

	it("#parseVariable", () => {

		let compiler = new Compiler();

		let res = compiler.parseVariable("varName.subName", "id");

		expect(
			res
		).to.deep.include({
			bindings: [ "{scope}.varName.subName" ],
			name: "vid",
			placeholders: { "scope": true },
		});

	});

});