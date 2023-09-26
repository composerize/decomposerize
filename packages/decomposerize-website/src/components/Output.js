import React from 'react';
import styled from 'styled-components';

import Section from './Section';
import Code from './Code';
import Results from './Results';

const Label = styled.div`
    display: table;
    margin-bottom: 20px;
    font-size: 11px;
    border: 1px solid #dcd4d8;
    border-top: 0px;
    background: #f7ebed;
    color: #6b2632;
    padding: 4px;
`;

const Blurb = styled.div`
    line-height: 32px;
    margin-top: -10px;
    margin-bottom: 10px;
`;

export default props => (
    <Section border>
        <Label>Output</Label>
        <Blurb>
            <p>
                Copy ready <Code>docker run</Code> command(s)
            </p>
            <p>
                For more help, please consult the{' '}
                <a href="https://docs.docker.com/engine/reference/commandline/run/" rel="noopener noreferrer" target="_blank">
                    docker run
                </a>{' '}
                documentation.
            </p>
        </Blurb>
        <Results output={props.output} />
    </Section>
);
