const { BehaviorSubject } = require('rxjs');



function NodeServerSubject(initialValue) {
    const self = this;
    
    self.nodeServerSubject = new BehaviorSubject(initialValue);
    console.log('Initializing NodeServerSubject');

    self.verify = () => {
        console.log('Verifying that I\'ve been initialized with initialValue = ' + self.initialValue);
    }

    self.set = (value) => {
        return self.nodeServerSubject.next(value);
    }

    self.subscribe = (subscriber) => {
        return self.nodeServerSubject.subscribe(subscriber);
    }
}

const nodeServerSubject = new NodeServerSubject(null);

nodeServerSubject.subscribe(server => console.log('I have received server' + server));

module.exports = {
    nodeServerSubject
}