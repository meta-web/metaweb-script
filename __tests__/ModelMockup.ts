/*
 * MetaWEB
 *
 * META Script implementation
 *
 * @package metaweb-script
 * @copyright 2017 Jiri Hybek <jiri@hybek.cz>
 * @license MIT
 */

import 'mocha';
import { expect } from 'chai';

import {ModelMockup} from '../src/ModelMockup';

describe('Model mockup', () => {

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
					hi: { $: 'HI' }
				}
			}
		}
	});

	it('should return single value', () => {

		expect( model.get(['single']) ).to.equal('value');

	});

	it('should return nested value', () => {

		expect( model.get(['multi', 'hello']) ).to.equal('HELLO');

	});

	it('should return composed value', () => {

		expect( model.get(['multi']) ).to.deep.equal({
			hello: 'HELLO',
			hi: 'HI'
		});

	});

	it('should return null value when prop not exists', () => {

		expect( model.get(['404']) ).to.be.null;

	});

	it('should return single attribute', () => {

		expect( model.attr(['multi'], ['singleAttr']) ).to.equal(true);

	});

	it('should return nested attribute', () => {

		expect( model.attr(['multi'], ['nestedAttr', 'test']) ).to.equal('TEST');

	});

	it('should return validity state', () => {

		expect( model.isValid(['multi']) ).to.equal(false);
		expect( model.isValid(['multi', 'hello']) ).to.equal(true);
		expect( model.isValid(['some']) ).to.be.null;

	});

	it('should return ready state', () => {

		expect( model.isReady(['multi']) ).to.equal(false);
		expect( model.isReady(['multi', 'hello']) ).to.equal(true);
		expect( model.isReady(['some']) ).to.be.null;

	});

	it('should return ref', () => {

		expect( model.ref(['hello', 'world']) ).to.deep.equal({
			path: ['hello', 'world']
		});

	});

});