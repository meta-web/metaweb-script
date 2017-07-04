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
 * Node config interface
 */
export interface IMockupNodeConfig {
	"_"?: any;
	[ K: string ]: IMockupNodeConfig|boolean|number|string;
	[ K: number ]: IMockupNodeConfig|boolean|number|string;
}

/**
 * Node instance interface
 */
export interface IMockupNode {
	(): any;
	__value: any;
	__children: { [K: string]: IMockupNode };
	[ K: string ]: any;
	[ K: number ]: any;
}

/**
 * Node proxy
 */
const NodeProxy : ProxyHandler<IMockupNode> = {

	/**
	 * Getter
	 */
	get: function(target: IMockupNode, prop: string) {
			
		return target.__children[prop];

	},

	/**
	 * Node call overload
	 */
	apply: function(target: IMockupNode, that: any, args: any) {

		if(target.__value){
			
			return target.__value;

		} else {

			let value = {};

			for(let i in target.__children){
				if(typeof i == 'string' && i.substr(0, 1) == '$') continue;
				value[i] = target.__children[i]();
			}

			return value;

		}

	}

};

/**
 * Mockup model class
 */
export class ModelMockup {

	/**
	 * Root node
	 */
	public root;

	/**
	 * Constructor
	 *
	 * @param rootNode Root node configuration
	 */
	public constructor(rootNode: IMockupNodeConfig){
		
		this.root = this.createNode(rootNode);

	}

	/**
	 * Creates new proxied node
	 *
	 * @param config Node config
	 */
	protected createNode(config: IMockupNodeConfig){

		let node: IMockupNode = Object.assign(function(){}, {
			__children: {},
			__value: (config._ ? config._ : null)
		});

		for(let i in config){

			if(i == "_") continue;

			if(config[i] instanceof Object)
				node.__children[i] = this.createNode(<IMockupNodeConfig>config[i]);
			else
				node.__children[i] = this.createNode({ _: config[i] });

		}

		return new Proxy(node, NodeProxy);

	}

}