import 'mocha';
import { expect } from 'chai';

import {Parse, ParseVariable, ParseInterpolation, ParsePropertyRef} from '../src/Parser';

describe("Parser", () => {

	describe("ParseVariable", () => {

		it('should parse single-level local variable', () => {

			expect(
				ParseVariable("varName", "id", false)
			).to.deep.include({
				bindings: "{scope}.varName",
				name: "vid",
				placeholders: { "scope": true },
			});

		});

		it('should parse multi-level local variable', () => {

			expect(
				ParseVariable("varName.subName", "id", false)
			).to.deep.include({
				bindings: "{scope}.varName.subName",
				name: "vid",
				placeholders: { "scope": true }
			});

		});

		it('should parse single-level root variable', () => {

			expect(
				ParseVariable("#varName", "id", false)
			).to.deep.include({
				bindings: "varName",
				name: "vid",
				placeholders: {}
			});

		});

		it('should parse multi-level root variable', () => {

			expect(
				ParseVariable("#varName.subName", "id", false)
			).to.deep.include({
				bindings: "varName.subName",
				name: "vid",
				placeholders: {}
			});

		});

		it('should parse single-level placeholder variable', () => {

			expect(
				ParseVariable("@varName", "id", false)
			).to.deep.include({
				bindings: "{varName}",
				name: "vid",
				placeholders: { varName: true }
			});

		});

		it('should parse multi-level placeholder variable', () => {

			expect(
				ParseVariable("@varName.subName", "id", false)
			).to.deep.include({
				bindings: "{varName}.subName",
				name: "vid",
				placeholders: { varName: true }
			});

		});

		it('should parse zero-level attribute', () => {

			expect(
				ParseVariable("$attr", "id", false)
			).to.deep.include({
				bindings: "{scope}.$attr",
				name: "vid",
				placeholders: { scope: true }
			});

		});

		it('should parse zero-level sub-attribute', () => {

			expect(
				ParseVariable("$attr.sub", "id", false)
			).to.deep.include({
				bindings: "{scope}.$attr.sub",
				name: "vid",
				placeholders: { scope: true }
			});

		});

		it('should parse single-level attribute', () => {

			expect(
				ParseVariable("varName$attr", "id", false)
			).to.deep.include({
				bindings: "{scope}.varName.$attr",
				name: "vid",
				placeholders: { scope: true }
			});

		});

		it('should parse single-level sub-attribute', () => {

			expect(
				ParseVariable("varName$attr.sub", "id", false)
			).to.deep.include({
				bindings: "{scope}.varName.$attr.sub",
				name: "vid",
				placeholders: { scope: true }
			});

		});

		it('should parse multi-level sub-attribute', () => {

			expect(
				ParseVariable("varName.subName$attr.sub", "id", false)
			).to.deep.include({
				bindings: "{scope}.varName.subName.$attr.sub",
				name: "vid",
				placeholders: { scope: true }
			});

		});

		it('should parse numerical sub-key', () => {

			expect(
				ParseVariable("varName.1.name", "id", false)
			).to.deep.include({
				bindings: "{scope}.varName.1.name",
				name: "vid",
				placeholders: { scope: true }
			});

		});


		it('should parse numerical sub-attribute', () => {

			expect(
				ParseVariable("varName$attr.1.name", "id", false)
			).to.deep.include({
				bindings: "{scope}.varName.$attr.1.name",
				name: "vid",
				placeholders: { scope: true }
			});

		});

		it('should parse root attribute', () => {

			expect(
				ParseVariable("#$attr", "id", false)
			).to.deep.include({
				bindings: "$attr",
				name: "vid",
				placeholders: {}
			});

		});

		it('should parse property pointer', () => {

			expect(
				ParseVariable("varName.subName", "id", true)
			).to.deep.include({
				bindings: "{scope}.varName.subName",
				name: "vid",
				placeholders: { scope: true }
			});

		});

	});

	describe("Parse", () => {

		it("should parse complex expression and return proper interface", () => {

			let r = Parse({}, 'if($singleAttr, #multi.hello, hi) ~ " " ~ IF(@record.truth == 42 OR hello$valid, "the TRUTH", "the DOOM") ~ " with RADIUS " ~ (2 * 3.141 * record["truth"])');

			expect(r.bindings).to.deep.include({
				"{scope}.$singleAttr": 1,
				"multi.hello": 1,
				"{scope}.hi": 1,
				"{record}.truth": 1,
				"{scope}.hello.$valid": 1,
				"{scope}.record": 1
			});

			expect(r).to.has.property('source');

		});

	});

	describe("ParseInterpolation", () => {

		it("should parse single expression in the middle", () => {

			let r = ParseInterpolation({}, 'Hello #{name}!');

			expect(r.bindings).to.deep.include({
				"{scope}.name": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse single expression at the beginning", () => {

			let r = ParseInterpolation({}, '#{name}!');

			expect(r.bindings).to.deep.include({
				"{scope}.name": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse single expression at the end", () => {

			let r = ParseInterpolation({}, 'Hello #{name}');

			expect(r.bindings).to.deep.include({
				"{scope}.name": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse multiple expressions", () => {

			let r = ParseInterpolation({}, 'Hello #{firstName} #{lastName}!');

			expect(r.bindings).to.deep.include({
				"{scope}.firstName": 1,
				"{scope}.lastName": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse complex expression", () => {

			let r = ParseInterpolation({}, 'Hello #{10 * if(#x > 1, 1, -1)}!');

			expect(r.bindings).to.deep.include({
				"x": 1
			});

			expect(r).to.has.property('source');

		});

	});

	describe("ParsePropertyRef", () => {

		it("should parse single-level local property", () => {

			let r = ParsePropertyRef('varName');

			expect(r.bindings).to.deep.include({
				"{scope}.varName": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse multi-level local property", () => {

			let r = ParsePropertyRef('varName.subName');

			expect(r.bindings).to.deep.include({
				"{scope}.varName.subName": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse single-level root property", () => {

			let r = ParsePropertyRef('#varName');

			expect(r.bindings).to.deep.include({
				"varName": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse multi-level root property", () => {

			let r = ParsePropertyRef('#varName.subName');

			expect(r.bindings).to.deep.include({
				"varName.subName": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse single-level placeholder property", () => {

			let r = ParsePropertyRef('@varName');

			expect(r.bindings).to.deep.include({
				"{varName}": 1
			});

			expect(r).to.has.property('source');

		});

		it("should parse multi-level placeholder property", () => {

			let r = ParsePropertyRef('@varName.subName');

			expect(r.bindings).to.deep.include({
				"{varName}.subName": 1
			});

			expect(r).to.has.property('source');

		});

	});

});