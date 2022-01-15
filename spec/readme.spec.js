import {JsonParser} from "../index.js";

describe('JsonParser/examples', () => {

    it('example from readme', () => {
        let output = '';
        const parser = new JsonParser({
            onobjectstart() {
                output += "Here we go...\n";
            },
            onkey(key) {
                output += "Got a key: " + key + "\n";
            },
            onstring(value) {
                output += "Got a value: " + value + "\n";
            },
        });
        parser.write('{"hel');
        parser.write('lo": "world"}');
        parser.end();
        expect(output)
            .toEqual('Here we go...\nGot a key: hello\nGot a value: world\n');
    });

});
