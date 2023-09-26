import React, { Component } from 'react';
import Decomposerize from 'decomposerize';
import 'normalize.css';
import 'html5-boilerplate/dist/css/main.css';
import './App.css';

import Header from './components/Header';
import Entry from './components/Entry';
import Output from './components/Output';
import Footer from './components/Footer';

const defaultCommand = `version: '3.3'
services:
    nginx:
        ports:
            - '80:80'
        volumes:
            - '/var/run/docker.sock:/tmp/docker.sock:ro'
        restart: always
        logging:
            options:
                max-size: 1g
        image: nginx`;

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: defaultCommand,
            output: Decomposerize(defaultCommand),
        };
        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(value) {
        this.setState({
            input: value,
            output: Decomposerize(value),
        });
    }

    render() {
        return (
            <div>
                <Header />
                <Entry command={this.state.input} onInputChange={this.onInputChange} />
                <Output output={this.state.output} />
                <Footer />
            </div>
        );
    }
}
