/**
 * @Source https://github.com/justmoon/node-extend
 * @License MIT
 */

var hasOwn = Object.prototype.hasOwnProperty
var toStr = Object.prototype.toString

var setProperty = Object.defineProperty
	? function (target: any, options: any) {
			if (options.name === '__proto__') {
				Object.defineProperty(target, options.name, {
					enumerable: true,
					configurable: true,
					value: options.newValue,
					writable: true
				})
			} else {
				target[options.name] = options.newValue
			}
	  }
	: function (target: any, options: any) {
			target[options.name] = options.newValue
	  }

var getProperty = Object.getOwnPropertyDescriptor
	? (obj: any, name: string) =>
			name === '__proto__' && hasOwn.call(obj, name) ? Object.getOwnPropertyDescriptor(obj, name)?.value : obj[name]
	: (obj: any, name: string) => (name === '__proto__' && !hasOwn.call(obj, name) ? undefined : obj[name])

export function isPlainObject(obj: any) {
	if (!obj || toStr.call(obj) !== '[object Object]') return false

	var hasOwnConstructor = hasOwn.call(obj, 'constructor')
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) return false

	var key
	for (key in obj) {
		break
	}

	return typeof key === 'undefined' || hasOwn.call(obj, key)
}

export function extend(target: any, source: any, ...args: any[]) {
	var opts,
		name,
		src,
		copy,
		copyIsArray,
		clone,
		deep = false

	if (typeof target === 'boolean') {
		deep = target
		target = source || {}
	}

	if (!target || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {}
	}

	for (var i = 0, l = args.length; i < l; ++i) {
		opts = args[i]
		if (!opts) continue
		for (name in opts) {
			src = getProperty(target, name)
			copy = getProperty(opts, name)
			if (target === copy) continue
			if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
				if (copyIsArray) {
					copyIsArray = false
					clone = src && Array.isArray(src) ? src : []
				} else {
					clone = src && isPlainObject(src) ? src : {}
				}
				setProperty(target, { name: name, newValue: extend(deep, clone, copy) })
			} else if (typeof copy !== 'undefined') {
				setProperty(target, { name: name, newValue: copy })
			}
		}
	}

	return target
}
