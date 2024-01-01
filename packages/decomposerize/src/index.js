// @flow

import YAML from 'yaml';
import Composeverter from 'composeverter';

import { MAPPINGS } from './mappings';

const getObjectByPath = (path: string, obj: any): any =>
    path.split('/').reduce((o, k) => {
        // $FlowFixMe
        if (k === ':first:') return o && Object.values(o)[0];

        // $FlowFixMe
        return o && o[k];
    }, obj);

export type ArgValueSeparator = '=' | ' ';

export type Configuration = {
    command?: string,
    rm?: boolean,
    detach?: boolean,
    multiline?: boolean,
    'long-args'?: boolean,
    'arg-value-separator'?: ArgValueSeparator,
};

export default (input: string, configuration: Configuration = {}): ?string => {
    const composeJson = YAML.parse(Composeverter.migrateToCommonSpec(input));
    const defaultConfiguration = {
        command: 'docker run',
        rm: false,
        detach: false,
        multiline: false,
        'long-args': false,
        'arg-value-separator': ' ',
    };
    const config = Object.assign(defaultConfiguration, configuration);

    const stringify = (value: any): string => {
        const stringValue = String(value);
        if (stringValue.match(/[\s"]/)) {
            const escapedString = stringValue.replace('"', '\\"');
            return String(`"${escapedString}"`);
        }
        return stringValue;
    };

    const commands = [];
    Object.entries(composeJson.services).forEach(([, service]) => {
        const commandOptions = [];

        if (config.rm === true) commandOptions.push('--rm');
        if (config.detach === true) commandOptions.push(config['long-args'] ? '--detach' : '-d');

        const pushOptionAndName = (argumentNames: string, value: String | string) => {
            let argument = argumentNames;
            if (argumentNames.includes('/')) argument = argumentNames.split('/')[config['long-args'] ? 0 : 1];

            const dash = argument.length === 1 ? '-' : '--';
            // $FlowFixMe
            if (value !== '' && value !== null)
                commandOptions.push(`${dash}${argument}${config['arg-value-separator']}${value.toString()}`);
            else commandOptions.push(`${dash}${argument}`);
        };

        const networkMode = getObjectByPath('network_mode', service);
        const networks = getObjectByPath('networks', service);
        if (networkMode) pushOptionAndName('network/net', networkMode);
        else if (networks)
            Object.entries(networks).forEach(([networkOrIndex, networkConfOrName]) => {
                const network =
                    typeof networkConfOrName === 'string' ? String(networkConfOrName) : String(networkOrIndex);

                // $FlowFixMe
                pushOptionAndName('network/net', String(network));
            });

        // $FlowFixMe: dynamic json object deconstruct
        Object.keys(service).forEach((serviceOption) => {
            Object.entries(MAPPINGS).forEach(([argumentNames, mapping]) => {
                // $FlowFixMe: dynamic json object deconstruct
                const { type, path } = mapping;

                if (!path.startsWith(`${serviceOption}/`) && path !== serviceOption) return;

                const pushOption = (value: String | string) => pushOptionAndName(argumentNames, value);

                const targetValue = getObjectByPath(path, service);
                if (type !== 'Networks' && !targetValue) return;

                if (type === 'Array') {
                    // $FlowFixMe: supposed to be an array
                    targetValue.forEach((v) => {
                        if (typeof v === 'object' || v === null) return;

                        pushOption(String(stringify(v)));
                    });
                }
                if (type === 'Ulimits') {
                    Object.entries(targetValue).forEach(([key, v]) => {
                        // $FlowFixMe: dynamic json object deconstruct
                        const { soft, hard } = v;
                        if (hard && soft) pushOption(String(`${key}=${soft}:${hard}`));
                        // $FlowFixMe: dynamic json object
                        else pushOption(String(`${key}=${v}`));
                    });
                }
                if (type === 'Switch') {
                    // $FlowFixMe
                    if (targetValue.toString() === 'true') pushOption('');
                }
                if (type === 'Value') {
                    pushOption(stringify(targetValue));
                }
                if (type === 'IntValue') {
                    pushOption(String(targetValue));
                }
                if (type === 'FloatValue') {
                    pushOption(String(targetValue));
                }
                if (type === 'DeviceBlockIOConfigRate') {
                    // $FlowFixMe: supposed to be an array
                    targetValue.forEach((v) => {
                        const { path: deviceIORatePath, rate } = v;
                        pushOption(String(`${deviceIORatePath}:${rate}`));
                    });
                }
                if (type === 'DeviceBlockIOConfigWeight') {
                    // $FlowFixMe: supposed to be an array
                    targetValue.forEach((v) => {
                        const { path: deviceIOWeightPath, weight } = v;
                        pushOption(String(`${deviceIOWeightPath}:${weight}`));
                    });
                }
                if (type === 'MapArray') {
                    // $FlowFixMe: supposed to be an array
                    targetValue.forEach((v) => {
                        if (typeof v !== 'object') return;

                        const mapValues = [];
                        Object.entries(v).forEach(([key, vv]) => mapValues.push(`${key}=${stringify(vv)}`));
                        pushOption(String(mapValues.join(',')));
                    });
                }
                if (type === 'Map') {
                    const mapValues = [];
                    Object.entries(targetValue).forEach(([key, vv]) => mapValues.push(`${key}=${stringify(vv)}`));
                    pushOption(String(mapValues.join(',')));
                }
            });
        });

        // $FlowFixMe
        commandOptions.push(service.image);

        // $FlowFixMe
        if (service.command) commandOptions.push(service.command);

        commands.push(
            `${config.command} ${commandOptions.join(config.multiline ? ' \\\n\t' : ' ')}`.replace(/[ ]+/g, ' '),
        );
    });
    return commands.join('\n');
};
