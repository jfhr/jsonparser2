import {JsonParser} from "../index.js";

describe('JsonParser', () => {

    let cb;
    let calls;

    beforeEach(() => {
        cb = {
            onobjectstart() { calls.push('onobjectstart') },
            onobjectend() { calls.push('onobjectend') },
            onarraystart() { calls.push('onarraystart') },
            onarrayend() { calls.push('onarrayend') },
            onkey(key) { calls.push(['onkey', key]) },
            onstring(value) { calls.push(['onstring', value]) },
            onnumber(value) { calls.push(['onnumber', value]) },
            onboolean(value) { calls.push(['onboolean', value]) },
            onnull() { calls.push('onnull') },
        };
        calls = [];
    });

    it('empty constructor', () => {
        new JsonParser();
    });

    it('constructor', () => {
        new JsonParser(cb);
    });

    it('end', () => {
        const p = new JsonParser(cb);
        p.end();
        expect(calls).toEqual([]);
    });

    it('empty json', () => {
        const p = new JsonParser(cb);
        p.write('');
        p.end();
        expect(calls).toEqual([]);
    });

    it('only whitespace', () => {
        const p = new JsonParser(cb);
        p.write(' ');
        p.end();
        expect(calls).toEqual([]);
    });

    it('only newline', () => {
        const p = new JsonParser(cb);
        p.write('\n');
        p.end();
        expect(calls).toEqual([]);
    });

    it('only carriage return', () => {
        const p = new JsonParser(cb);
        p.write('\r');
        p.end();
        expect(calls).toEqual([]);
    });

    it('only tab', () => {
        const p = new JsonParser(cb);
        p.write('\t');
        p.end();
        expect(calls).toEqual([]);
    });

    it('empty object', () => {
        const p = new JsonParser(cb);
        p.write('{}');
        p.end();
        expect(calls).toEqual([
            'onobjectstart',
            'onobjectend',
        ]);
    });

    it('empty string', () => {
        const p = new JsonParser(cb);
        p.write('""');
        p.end();
        expect(calls).toEqual([
            ['onstring', ''],
        ]);
    });

    it('string', () => {
        const p = new JsonParser(cb);
        p.write('"a"');
        p.end();
        expect(calls).toEqual([
            ['onstring', 'a'],
        ]);
    });

    it('string escaped backslash', () => {
        const p = new JsonParser(cb);
        p.write('"\\\\"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\\'],
        ]);
    });

    it('string escaped quote', () => {
        const p = new JsonParser(cb);
        p.write('"\\\""');
        p.end();
        expect(calls).toEqual([
            ['onstring', '"'],
        ]);
    });

    it('string newline', () => {
        const p = new JsonParser(cb);
        p.write('"\\n"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\n'],
        ]);
    });

    it('string carriage return', () => {
        const p = new JsonParser(cb);
        p.write('"\\r"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\r'],
        ]);
    });

    it('string tab', () => {
        const p = new JsonParser(cb);
        p.write('"\\t"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\t'],
        ]);
    });

    it('string backspace', () => {
        const p = new JsonParser(cb);
        p.write('"\\b"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\b'],
        ]);
    });

    it('string formfeed', () => {
        const p = new JsonParser(cb);
        p.write('"\\f"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\f'],
        ]);
    });

    it('string slash', () => {
        const p = new JsonParser(cb);
        p.write('"\\/"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '/'],
        ]);
    });

    it('string unicode escape', () => {
        const p = new JsonParser(cb);
        p.write('"\\u0000"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\u0000'],
        ]);
    });

    it('string unicode escape 1', () => {
        const p = new JsonParser(cb);
        p.write('"\\u0001"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\u0001'],
        ]);
    });

    it('string unicode escape 1234', () => {
        const p = new JsonParser(cb);
        p.write('"\\u1234"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\u1234'],
        ]);
    });

    it('string unicode escape abcd', () => {
        const p = new JsonParser(cb);
        p.write('"\\uabcd"');
        p.end();
        expect(calls).toEqual([
            ['onstring', '\uabcd'],
        ]);
    });

    it('zero', () => {
        const p = new JsonParser(cb);
        p.write('0');
        p.end();
        expect(calls).toEqual([
            ['onnumber', 0],
        ]);
    });

    it('one', () => {
        const p = new JsonParser(cb);
        p.write('1');
        p.end();
        expect(calls).toEqual([
            ['onnumber', 1],
        ]);
    });

    it('negative one', () => {
        const p = new JsonParser(cb);
        p.write('-1');
        p.end();
        expect(calls).toEqual([
            ['onnumber', -1],
        ]);
    });

    it('decimal number', () => {
        const p = new JsonParser(cb);
        p.write('1.1');
        p.end();
        expect(calls).toEqual([
            ['onnumber', 1.1],
        ]);
    });

    it('number with exponent', () => {
        const p = new JsonParser(cb);
        p.write('1e1');
        p.end();
        expect(calls).toEqual([
            ['onnumber', 1e1],
        ]);
    });

    it('number with negative exponent', () => {
        const p = new JsonParser(cb);
        p.write('1e-1');
        p.end();
        expect(calls).toEqual([
            ['onnumber', 1e-1],
        ]);
    });

    it('decimal number with exponent', () => {
        const p = new JsonParser(cb);
        p.write('1.1e1');
        p.end();
        expect(calls).toEqual([
            ['onnumber', 1.1e1],
        ]);
    });

    it('true', () => {
        const p = new JsonParser(cb);
        p.write('true');
        p.end();
        expect(calls).toEqual([
            ['onboolean', true],
        ]);
    });

    it('false', () => {
        const p = new JsonParser(cb);
        p.write('false');
        p.end();
        expect(calls).toEqual([
            ['onboolean', false],
        ]);
    });

    it('null', () => {
        const p = new JsonParser(cb);
        p.write('null');
        p.end();
        expect(calls).toEqual([
            'onnull',
        ]);
    });

    it('object with string value', () => {
        const p = new JsonParser(cb);
        p.write('{"a":"a"}');
        p.end();
        expect(calls).toEqual([
            'onobjectstart',
            ['onkey', 'a'],
            ['onstring', 'a'],
            'onobjectend',
        ]);
    });

    it('object with number value', () => {
        const p = new JsonParser(cb);
        p.write('{"a":1}');
        p.end();
        expect(calls).toEqual([
            'onobjectstart',
            ['onkey', 'a'],
            ['onnumber', 1],
            'onobjectend',
        ]);
    });

    it('object with array value', () => {
        const p = new JsonParser(cb);
        p.write('{"a":[]}');
        p.end();
        expect(calls).toEqual([
            'onobjectstart',
            ['onkey', 'a'],
            'onarraystart',
            'onarrayend',
            'onobjectend',
        ]);
    });

    it('object with object value', () => {
        const p = new JsonParser(cb);
        p.write('{"a":{}}');
        p.end();
        expect(calls).toEqual([
            'onobjectstart',
            ['onkey', 'a'],
            'onobjectstart',
            'onobjectend',
            'onobjectend',
        ]);
    });

    it('empty array', () => {
        const p = new JsonParser(cb);
        p.write('[]');
        p.end();
        expect(calls).toEqual([
            'onarraystart',
            'onarrayend',
        ]);
    });

    it('array with string value', () => {
        const p = new JsonParser(cb);
        p.write('["a"]');
        p.end();
        expect(calls).toEqual([
            'onarraystart',
            ['onstring', 'a'],
            'onarrayend',
        ]);
    });

    it('array with number value', () => {
        const p = new JsonParser(cb);
        p.write('[0]');
        p.end();
        expect(calls).toEqual([
            'onarraystart',
            ['onnumber', 0],
            'onarrayend',
        ]);
    });

    it('array with two number values', () => {
        const p = new JsonParser(cb);
        p.write('[0, 1]');
        p.end();
        expect(calls).toEqual([
            'onarraystart',
            ['onnumber', 0],
            ['onnumber', 1],
            'onarrayend',
        ]);
    });

    it('array with string and number value', () => {
        const p = new JsonParser(cb);
        p.write('["a", 0]');
        p.end();
        expect(calls).toEqual([
            'onarraystart',
            ['onstring', 'a'],
            ['onnumber', 0],
            'onarrayend',
        ]);
    });

    it('array with array value', () => {
        const p = new JsonParser(cb);
        p.write('[[]]');
        p.end();
        expect(calls).toEqual([
            'onarraystart',
            'onarraystart',
            'onarrayend',
            'onarrayend',
        ]);
    });

    it('array with object value', () => {
        const p = new JsonParser(cb);
        p.write('[{}]');
        p.end();
        expect(calls).toEqual([
            'onarraystart',
            'onobjectstart',
            'onobjectend',
            'onarrayend',
        ]);
    });

});
