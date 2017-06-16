/*
 * MetaWEB
 *
 * META Script implementation
 *
 * @package metaweb-script
 * @copyright 2017 Jiri Hybek <jiri@hybek.cz>
 * @license MIT
 */

export class ModelMockup {

	protected data: any = {};

	public constructor(data: any){
		
		this.data = data;

	}

	public getValue(state: any, path: Array<string> = []){

		if(!(state instanceof Object))
			return state;

		if(path.length > 0){

			let k = path.shift();

			if(state._ && state._[k])
				return this.getValue(state._[k], path);
			else
				return null;

		} else {

			if(state._){

				let r = {};

				for(let k in state._)
					r[k] = this.getValue(state._[k]);

				return r;

			} else {
				
				return state['$'] || null;

			}

		}

	}

	public get(path: Array<string> = []){

		return this.getValue(this.data, path);

	}

	public getAttr(state: any, propPath: Array<string> = [], attrPath: Array<string>){

		if(propPath.length > 0){

			let k = propPath.shift();

			if(state._ && state._[k])
				return this.getAttr(state._[k], propPath, attrPath);
			else
				return null;

		} else {

			let attrKey = attrPath.shift();

			if(state['@' + attrKey] !== undefined)
				return this.getValue(state['@' + attrKey], attrPath);
			else
				return null;

		}		

	}

	public attr(propPath: Array<string> = [], attrPath: Array<string>){

		return this.getAttr(this.data, propPath, attrPath);

	}

	public isValid(path: Array<string>){

		return this.attr(path, ['valid']);

	}

	public isReady(path: Array<string>){

		return this.attr(path, ['ready']);

	}

	public ref(path: Array<string>){

		return {
			path: path
		};

	}

}