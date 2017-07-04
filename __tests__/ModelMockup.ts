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
		single: { _: 'value' },
		multi: {
			'$valid': false,
			'$ready': false,
			'$singleAttr': true,
			'$nestedAttr': {
				'test': 'TEST'
			},
			hello: { _: 'HELLO' , '$valid': true, '$ready': true },
			hi: { _: 'HI' }
		}
	});

	it('should return single value', () => {

		expect( model.root.single() ).to.equal('value');

	});

	it('should return nested value', () => {

		expect( model.root.multi.hello() ).to.equal('HELLO');

	});

	it('should return composed value', () => {

		expect( model.root.multi() ).to.deep.equal({
			hello: 'HELLO',
			hi: 'HI'
		});

	});

	it('should throw when prop not exists', () => {

		expect(() => {
			model.root.notFound()
		}).to.be.throw;;
		

	});

	it('should return single attribute', () => {

		expect( model.root.multi.$singleAttr() ).to.equal(true);

	});

	it('should return nested attribute', () => {

		expect( model.root.multi.$nestedAttr.test() ).to.equal('TEST');

	});

});