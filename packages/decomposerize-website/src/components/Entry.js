import React from 'react';
import styled from 'styled-components/macro';

import Section from './Section';
import LinedTextInput from './LinedTextInput';
import Code from './Code';
import CarbonAds from './CarbonAds';

const Blurb = styled.div`
    line-height: 32px;
    margin-top: -10px;
    margin-bottom: 10px;
`;

export default function Entry(props) {
    return (
        <Section topPadding>
            <div
                css={`
                    display: flex;
                `}
            >
                <div
                    css={`
                        flex-grow: 1;
                    `}
                >
                    <Blurb>
                        <p>
                            Convert your docker compose file to <Code>$ docker run</Code> command(s) :)
                        </p>
                        <p>
                            Paste your{' '}
                            <a
                                href="https://docs.docker.com/compose/compose-file/"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                docker compose file
                            </a>{' '}
                            content into the box below!
                        </p>
                        <p>
                            Looking for the reverse (<Code>docker run</Code> command(s) to Docker compose) ? Try{' '}
                            <a href="https://composerize.com" rel="noopener noreferrer" target="_blank">
                                Composerize
                            </a>
                        </p>
                        <p>
                            Want to convert from Docker compose file formats ? Try{' '}
                            <a href="http://composeverter.com" rel="noopener noreferrer" target="_blank">
                                Composeverter
                            </a>
                        </p>
                    </Blurb>
                    <LinedTextInput
                        value={props.input}
                        onValueChange={props.onInputChange}
                        numOfLines={10}
                        erroredLines={props.erroredLines}
                    />
                    <pre style={{ color: 'red' }}>{props.error}</pre>
                </div>
                <div
                    css={`
                        padding-left: 22px;
                        padding-bottom: 18px;
                        margin-top: -8px;
                    `}
                >
                    <CarbonAds />
                </div>
            </div>
        </Section>
    );
}
