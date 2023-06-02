const NO_OP_CB = {
    onobjectstart: () => {},
    onobjectend: () => {},
    onarraystart: () => {},
    onarrayend: () => {},
    onkey: () => {},
    onstring: () => {},
    onnumber: () => {},
    onboolean: () => {},
    onnull: () => {},
}

export class JsonParser {
    /**
     * Create a new JsonParser.
     * @param cb {Partial<{
     *     onobjectstart: () => void,
     *     onobjectend: () => void,
     *     onarraystart: () => void,
     *     onarrayend: () => void,
     *     onkey: (key: string) => void,
     *     onstring: (value: string) => void,
     *     onnumber: (value: number) => void,
     *     onboolean: (value: boolean) => void,
     *     onnull: () => void,
     * }>?}
     */
    constructor(cb) {
        this.cb = {...NO_OP_CB, ...cb};
        this.isClosed = false;

        this.stack = [];
        this.isObjectKey = false;
        this.isString = false;
        this.isStringEscape = false;
        this.unicodeEscapeSequenceIndex = -1;
        this.unicodeEscapeSequenceValue = 0;
        this.isNumber = false;
        this.isNegativeNumber = false;
        this.digitsAfterDecimalPoint = null;
        this.exponentValue = null;
        this.isNegativeExponent = false;
        this.isConstant = false;
        this.currentValue = null;
    }

    #callCallback(callback, ...args) {
        this.isInsideCallback = true;
        try {
            callback.call(this, ...args);
        } finally {
            this.isInsideCallback = false;
        }
    }

    #peek() {
        if (this.stack.length === 0) {
            return null;
        }
        return this.stack[this.stack.length - 1];
    }

    #pushObject() {
        this.stack.push('{');
    }

    #pushArray() {
        this.stack.push('[');
    }

    #pop() {
        this.stack.pop();
    }

    #isObject() {
        return this.#peek() === '{';
    }

    #isArray() {
        return this.#peek() === '[';
    }

    #handleStringCharacter(c) {
        if (this.isStringEscape) {
            if (c === '\\') {
                this.currentValue += c;
            } else if (c === '"') {
                this.currentValue += c;
            } else if (c === 'n') {
                this.currentValue += '\n';
            } else if (c === 'r') {
                this.currentValue += '\r';
            } else if (c === 't') {
                this.currentValue += '\t';
            } else if (c === 'b') {
                this.currentValue += '\b';
            } else if (c === 'f') {
                this.currentValue += '\f';
            } else if (c === '/') {
                this.currentValue += '/';
            } else if (c === 'u') {
                this.unicodeEscapeSequenceIndex = 0;
            }
            this.isStringEscape = false;
        } else if (this.unicodeEscapeSequenceIndex > -1) {
            this.unicodeEscapeSequenceValue *= 16;
            this.unicodeEscapeSequenceValue += this.#parseHexDigit(c);
            this.unicodeEscapeSequenceIndex++;
            if (this.unicodeEscapeSequenceIndex === 4) {
                this.currentValue += String.fromCodePoint(this.unicodeEscapeSequenceValue);
                this.unicodeEscapeSequenceValue = 0;
                this.unicodeEscapeSequenceIndex = -1;
            }
        } else if (c === '\\') {
            this.isStringEscape = true;
        } else if (c === '"') {
            this.#finishCurrentValue();
        } else {
            this.currentValue += c;
        }
    }

    #handleNumberCharacter(c) {
        if (c === 'e' || c === 'E') {
            this.exponentValue = 0;
        } else if (c === '-') {
            if (this.exponentValue !== null) {
                this.isNegativeExponent = true;
            }
        } else if (c === '.') {
            this.digitsAfterDecimalPoint = 0;
        } else if (this.#isDigit(c)) {
            if (this.exponentValue !== null) {
                this.exponentValue *= 10;
                this.exponentValue += this.#parseDigit(c);
            } else if (this.digitsAfterDecimalPoint !== null) {
                this.digitsAfterDecimalPoint++;
                this.currentValue += Math.pow(10, -this.digitsAfterDecimalPoint) * this.#parseDigit(c);
            } else {
                this.currentValue *= 10;
                this.currentValue += this.#parseDigit(c);
            }
        } else {
            this.#finishCurrentValue();
            this.#handleOtherCharacter(c);
        }
    }

    #handleOtherCharacter(c) {
        if (this.#isWhitespace(c)) {
            return;
        } else if (c === '{') {
            this.#pushObject();
            this.isObjectKey = true;
            this.#callCallback(this.cb.onobjectstart);
        } else if (c === '}') {
            this.#pop();
            this.#callCallback(this.cb.onobjectend);
        } else if (c === '[') {
            this.#pushArray();
            this.#callCallback(this.cb.onarraystart);
        } else if (c === ']') {
            this.#pop();
            this.#callCallback(this.cb.onarrayend);
        } else if (c === '"') {
            this.isString = true;
            this.currentValue = '';
        } else if (c === '-') {
            this.isNumber = true;
            this.isNegativeNumber = true;
        } else if (this.#isDigit(c)) {
            this.isNumber = true;
            this.currentValue = this.#parseDigit(c);
        } else if (c === ',') {
            if (this.#isObject()) {
                this.#finishCurrentValue();
                this.isObjectKey = true;
            } else if (this.#isArray()) {
                this.#finishCurrentValue();
            }
        } else if (c === ':') {
            this.#finishCurrentValue();
            this.isObjectKey = false;
        } else if (this.isConstant) {
            this.currentValue += c;
        } else {
            this.isConstant = true;
            this.currentValue = c;
        }
    }

    /**
     * Parse a partial or complete JSON string.
     * @param text {string} The text to write to the parser
     */
    write(text) {
        for (const c of text) {
            if (this.isClosed) {
                return;
            } else if (this.isString) {
                this.#handleStringCharacter(c);
            } else if (this.isNumber) {
                this.#handleNumberCharacter(c);
            } else {
                this.#handleOtherCharacter(c);
            }
        }
    }

    #finishCurrentValue() {
        if (this.isString) {
            this.isString = false;
            if (this.isObjectKey) {
                this.isObjectKey = false;
                this.#callCallback(this.cb.onkey, this.currentValue);
            } else {
                this.#callCallback(this.cb.onstring, this.currentValue);
            }
        } else if (this.isNumber) {
            this.isNumber = false;
            if (this.exponentValue) {
                if (this.isNegativeExponent) {
                    this.currentValue = this.currentValue * Math.pow(10, -this.exponentValue);
                } else {
                    this.currentValue = this.currentValue * Math.pow(10, this.exponentValue);
                }
            }
            if (this.isNegativeNumber) {
                this.currentValue = -this.currentValue;
                this.isNegativeNumber = false;
            }
            this.#callCallback(this.cb.onnumber, this.currentValue);
        } else if (this.isConstant) {
            this.isConstant = false;
            if (this.currentValue === 'null') {
                this.#callCallback(this.cb.onnull);
            } else if (this.currentValue === 'true') {
                this.#callCallback(this.cb.onboolean, true);
            } else if (this.currentValue === 'false') {
                this.#callCallback(this.cb.onboolean, false);
            }
        }
        this.currentValue = null;
    }

    #isWhitespace(c) {
        return c === ' ' || c === '\n' || c === '\r' || c === '\t';
    }

    #isDigit(c) {
        return '0' <= c && c <= '9';
    }

    #parseDigit(c) {
        return parseInt(c, 10);
    }

    #parseHexDigit(c) {
        return parseInt(c, 16);
    }

    /**
     * Finish parsing. Any subsequent calls will be ignored.
     * @param text {string?} If provided, will be written to the parser as the final value before closing.
     */
    end(text) {
        if (text) {
            this.write(text);
        }
        this.isClosed = true;
        if (!this.isInsideCallback) {
            this.#finishCurrentValue();
        }
    }
}
