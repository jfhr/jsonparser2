import {JsonParser} from "../index.js";
import * as https from "https";

describe('JsonParser/performance', () => {

    it('jsonparser2: Q2063', (done) => {
        console.time('jsonparser2: Q2063');
        let isP1163 = false;
        let isP1163Value = false;
        const parser = new JsonParser({
            onkey(key) {
                if (key === 'P1163') {
                    isP1163 = true;
                }
                if (isP1163 && key === 'value') {
                    isP1163Value = true;
                }
            },
            onstring(value) {
                if (isP1163Value) {
                    let result = value;
                    this.end();
                    console.timeEnd('jsonparser2: Q2063');
                    expect(result).toEqual('application/json');
                    done();
                }
            }
        });
        https.get('https://jfhr.de/jsonparser2/Q2063.json', res => {
            res.setEncoding('utf-8');
            res.on('error', err => {
                done.fail(err);
            });
            res.on('data', chunk => {
                parser.write(chunk);
            });
        });
    });

    it('JSON.parse: Q2063', (done) => {
        console.time('JSON.parse: Q2063');
        let jsonString = '';
        https.get('https://jfhr.de/jsonparser2/Q2063.json', res => {
            res.on('error', err => {
                done.fail(err);
            });
            res.on('data', chunk => {
                jsonString += chunk;
            });
            res.on('close', () => {
                try {
                    const data = JSON.parse(jsonString);
                    let result = data.entities.Q2063.claims.P1163[0].mainsnak.datavalue.value;
                    console.timeEnd('JSON.parse: Q2063');
                    expect(result).toEqual('application/json');
                    done();
                } catch (err) {
                    done.fail(err);
                }
            });
        });
    });

});
