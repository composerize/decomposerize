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
            error: '',
            erroredLines: [],
        };
        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(value) {
        this.setState({
            input: value,
        });
        this.updateConversion();
    }

    updateConversion() {
        this.setState((state) => {
            try {
                return {
                    output: Decomposerize(state.input),
                    error: '',
                    erroredLines: [],
                };
            } catch (e) {
                return {
                    error: e.toString(),
                    output: '#see error message(s)',
                    erroredLines: e.lines,
                };
            }
        });
    }

    render() {
        return (
            <div>
                <Header />
                <Entry
                    input={this.state.input}
                    onInputChange={this.onInputChange}
                    error={this.state.error}
                    erroredLines={this.state.erroredLines}
                />
                <Output output={this.state.output} />
                <Footer />
            </div>
        );
    }
}
