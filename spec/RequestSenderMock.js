class RequestSenderMock {

    constructor() {
        this._options = [];
    }

    request(options, callback) {
        this._options.push(options);
        if(this.response) {
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
        this.response = {
            statusCode : status
        };
        return this;
    }
}

module.exports = RequestSenderMock;