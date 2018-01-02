class RequestSenderMock {

    constructor() {
        this._options = [];
    }

    request(options, callback) {
        this._options.push(options);
        if(this.response) {
            console.log('Calling callback for ' + JSON.stringify(options));
            callback.apply(this, [null, this.response, null])
        }
        //callback.call();
    }

    get options() {
        if(this._options.length === 1) {
            return this._options[0];
        }
        return this._options;
    }

    responseStatus(status) {
        this._options = [];
        this.response = {
            statusCode : status
        };
        return this;
    }

    reset() {
        this._options = [];
    }
}

module.exports = RequestSenderMock;