# metaweb-script

![build status](http://jenkins.cloud.cryonix.cz/buildStatus/icon?job=metaweb-script)

The JavaScript implementation for the META Script of the META Web project.

Transpiles the META Script into a native JavaScript code. Ready for metaweb-model package.

Check out the [META Script Playground](http://play.metahub.cloud/meta-script/) to try it out.

**NOTE:** This library requires support of the ECMAScript 2015 (ES6) standard.

## Usage

```javascript
var Compiler = require("metaweb-script").Compiler;
var Model = require("metaweb-script").ModelMockup;

var placeholders = { "scope": model.root };

var compiler = new Compiler();
var model = new ModelMockup({ "name": "world" }); //or null if not using model references

//Compile script
var script1 = compiler.parseScript("1+1");

//Execute
var res1 = script1.executor.call(null, model.root, placeholders);

//Compile string interpolation
var script2 = compiler.compileInterpolation("Hello #{name}!");

//Execute
var res2 = var res1 = script1.executor.call(null, model.root, placeholders);

//Compile property reference
var script3 = compiler.compilePropertyRef("name");

//Execute
var res3 = script1.executor.call(null, model.root, placeholders);

//Register custom function
compiler.registerFunction('hello', {
    renderer: function(name, args){ return '"Hello ' + args.join(", ") + '"' ; },
    minArgs: 1,
    maxArgs: 2
});

compiler.compileScript("hello('John', 'Jack')"); //return "Hello John, Jack";
```

### TypeScript

This package also contains TypeScript definition file and can be directly imported.

```typescript
import {Compiler} from 'metaweb-script';

let compiler = new Compiler();

let script1 = compiler.parseScript("1+1");
//etc...
```

### Compiled IScript interface

When a script is transpiled then following interface is returned as a result:

```javascript
var res = {
    source: string, //Original source code
    executor: Function, //Transpiled function instance
    bindings: Array<string>, //Array of references property paths, used for model change binding
    js: string //Transpiled JavaScript code from which executor function is created
};
```

## META Script Syntax

META Script is a single expression language. You can imagine it as a spreadsheet formula but with properties instead of cells or as a functional language.

Script has a simple structure:

`<operand> [operator <operand>]`

### Comments

Comments must be written between `/*` and `*/`.

```
1 + /*comment*/ 2
```

### Constants

- Numeric: `1` or `3.141`
- String: `"hello world"` or `'hello world'`
- Boolean: `true`, `TRUE`, `false`, `FALSE`, `null` or `NULL`

### Properties & Attributes

META Script always references META Model properties and optionally it's attributes - see `metaweb-model` package.

Property is written using following notation:

`[@#]<name>[.<sub_name>[$<attribute>.<sub_attribute>]][value_property]`

- Variable or attribute name can contain only English letters, numbers and underscores
- Variable or attribute name must NOT start with a number
- Variable or attribute name cannot start with '__' - reserved for internal model properties
- `#` sign references property path from a model root
- `@` sign references a property placeholder
- `.` references sub property or sub-attribute in a model tree
- `$` sign references a property attribute

Each property or an attribute returns a value. If the value is an object we can access its properties using square bracket notation:

`my.prop['personal']['first_name']`

or with an attribute:

`my.prop$options[0]`

Some examples:

```
/* Local property */
firstName

/* Root property */
#customer.firstName */

/* Placeholder property */
@record.firstName

/* Access to an attribute */
firstName$valid
firstName$required

/* Access to a value property */
#user.role$items[0]['label']
```

### Operators

- Arithmetic: `+`, `-`, `*`, `/`, `%` (modulo)
- Comparison: `==`, `!=`, `>`, `>=`, `<`, `<=`
- Logic: `&&`, `||`, `!`, `and`, `AND`, `or`, `OR`, `not`, `NOT`
- String: `~` (string concat)

### String Interpolation

We can use `#{expression}` notation to easily insert expressions or variables into strings:

```
'Hello #{name}'
```

### Functions

Functions are a type of the operand which always return a value and accept arguments.

Function is written as:

`<function_name>(<arguments>)`

- Function name can contain only English letters, numbers and underscores
- Function name must NOT start with a number
- Function name must be always followed with round brackets
- Function arguments are separated using `,`

Examples:

```
min(x, 10)
empty(my.prop)
MAX(0, y)
```

**Built-in functions:**
- `min(number, ...)` (min value)
- `max(number, ...)` (max value)
- `abs(number)` (absolute value)
- `sqrt(number)` (square root)
- `pow(number, exp)` (power number by exponent)
- `nan(value)` (returns boolean, if value is NaN)
- `finite(number)` (returns boolean, if value is finite number)
- `substr(string, from, length)` (returns substring)
- `strpos(string, string)` (returns index of first occurance of second string in first string)
- `rstrpos(string, string)` (returns index of last occurance of second string in first string)
- `empty(value)` (returns boolean, if value is empty)
- `defined(property)` (returns boolean, if property or it's value property is defined)

### Conditions

Conditional expressions are written as an `IF` functions with three arguments:

1. Condition expression
2. If true expression
3. If false expression

Examples:

```
IF(x > 1, 'Yes', 'No')
iF(x > 1, a + 1, a - 1)
If(x > 1 AND x < 10, true, FALSE)
if(x <= 0, -1, x)
```

### More Examples

Following examples represent various META Model use-cases. META Script expressions are written in double quotes.

```plain
/* Condition - field is required only if sameAsInvoice is not true */
@record.delivery.address$required = "!@record.delivery.sameAsInvoice"
@record.delivery.address$required = "NOT @record.delivery.sameAsInvoice"
@record.delivery.address$required = "if(@record.delivery.sameAsInvoice, false, true)"

/* Strings - fullName consists of firstName and lastName properties delimeted by a space string */
fullName = "firstName ~ ' ' ~ lastName"

/* Or with interpolation parser */
fullName = "#{firstName} #{lastName}"

/* Arithmetics */
totalPrice = "(pricePerHour * 24) * days"
y = "x * 1.5 + a"
c = "sqrt( pow(a, 2) + pow(b, 2) )"

/* Enable if another field is not empty */
prop$readonly = "empty(name)"

/* Enable if another field is valid */
prop$readonly = "not anotherProp$valid"

/* Required if age is grater or equal than 21 */
prop$required = "#customer.age >= 21"
```

## Building and Testing

```
npm run build
npm test
```

## License

The MIT License (MIT)  
(c) 2017 Jiri Hybek <jiri@hybek.cz>