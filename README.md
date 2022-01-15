# jsonparser2


⚠️ `jsonparser2` is in an early pre-release state.
Please don't use it in productive applications! ⚠️


Streaming JSON parser.

## Installation

```shell
npm install @jfhr/jsonparser2
```

Works in node.js and in the browser!

## Usage

`jsonparser2` has a callback-based API. You can find more callbacks below!

```javascript
import { JsonParser } from 'jsonparser2';
const parser = new JsonParser({
    onobjectstart() {
        console.log("Here we go...");
    },
    onkey(key) {
        console.log("Got a key: " + key);
    },
    onstring(value) {
        console.log("Got a value: " + value);
    },
});
parser.write('{"hel');
parser.write('lo": "world"}');
parser.end();
```

Output: 

```text
Here we go...
Got a key: hello
Got a value: world
```

### Parse node.js http/https responses

Responses from the node.js `http` and `https` modules are `Buffer`s by default, not strings.
You can use the builtin `StringDecoder` to get strings and pass the to a `JsonParser` 
instance.

```javascript
import * as https from 'https';
import { StringDecoder } from "string_decoder";
import { JsonParser } from 'jsonparser2';

// Make sure to use the right encoding, utf-8 is just an example
const decoder = new StringDecoder('utf-8');
const parser = new JsonParser({
    // Your callbacks here...
});

https.get('https://jfhr.de/jsonparser2/Q2063.json', res => {
    res.on('data', chunk => {
        parser.write(decoder.write(chunk));
    });
    res.on('close', () => {
        parser.end();
    });
});
```

## API Reference

### Callbacks

Inside all callbacks you can use `this` to refer to the parser itself, e.g.
call `this.end()` to finish parsing when you find a specific value.

If you use `this.write()` inside a callback, make sure you don't cause an infinite loop!


#### `onobjectstart: () => void`

Called when the start of an object is encountered.


#### `onobjectend: () => void`

Called when the end of an object is encountered.


#### `onarraystart: () => void`

Called when the start of an array is encountered.


#### `onarrayend: () => void`

Called when the end of an array is encountered.


#### `onkey: (key: string) => void`

Called when an object key is encountered. The key is passed as a parameter.


#### `onstring: (value: string) => void`

Called when a string value is encountered. The value is passed as a parameter.


#### `onnumber: (value: number) => void`

Called when a numeric value is encountered. The value is passed as a parameter.


#### `onboolean: (value: boolean) => void`

Called when a boolean value is encountered. The value is passed as a parameter.


#### `onnull: () => void`

Called when a null value is encountered.


### Methods

#### `new JsonParser(cb)`

Creates a new parser with the given callbacks. All callbacks are optional.


#### `JsonParser.write(text)`

Write the string `text` to the parser. `text` **must** be part of a valid JSON string,
otherwise the behavior is undefined!


#### `JsonParser.end()`

Close the parser and stop processing. Subsequent calls to `write()` and `end()` will be 
ignored. 
