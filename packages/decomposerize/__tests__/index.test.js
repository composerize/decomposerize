/* eslint-env jest */

import Decomposerize from '../src';

test('return empty when invalid yaml', () => {
    expect(Decomposerize('foo bar"')).toMatchInlineSnapshot(`""`);
});

test('return empty when empty yaml', () => {
    expect(Decomposerize('#xxx"')).toMatchInlineSnapshot(`""`);
});

test('return empty when no services yaml', () => {
    expect(
        Decomposerize(`
    # ignored : docker stop

    version: '3.3'
    services:
  `),
    ).toMatchInlineSnapshot(`""`);
});

test('multiple docker run command', () => {
    const compose = `
    version: '3.3'
    services:
        baz:
            ports:
                - '80:80'
            image: 'foobar/baz:latest'
        buzz:
            ports:
                - '80:80'
            image: 'foobar/buzz:latest'
        nginx:
            ports:
                - '80:80'
            volumes:
                - '/var/run/docker.sock:/tmp/docker.sock:ro'
            restart: always
            logging:
                options:
                    max-size: 1g
            image: nginx
  `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot(
        `
        "docker run -p 80:80 foobar/baz:latest
        docker run -p 80:80 foobar/buzz:latest
        docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx"
    `,
    );
});

test('basic docker run command', () => {
    const compose = `
    version: '3.3'
    services:
        baz:
            ports:
                - '80:80'
            image: 'foobar/baz:latest'
  `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot('"docker run -p 80:80 foobar/baz:latest"');
});

test('basic docker create command', () => {
    const compose = `
    version: '3.3'
    services:
        baz:
            ports:
                - '80:80'
            image: 'foobar/baz:latest'
  `;

    expect(Decomposerize(compose, { command: 'docker create' })).toMatchInlineSnapshot(
        '"docker create -p 80:80 foobar/baz:latest"',
    );
});

test('docker run command with options', () => {
    const compose = `
    version: '3.3'
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
            image: nginx
  `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot(
        '"docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx"',
    );
});

test('spacing is quoted', () => {
    const compose = `
    version: '3.3'
    services:
        nginx:
            ports:
                - '80:80'
            volumes:
                - '/var/run/spac es/docker.sock:/tmp/spac es/docker.sock:ro'
            restart: always
            logging:
                options:
                    max-size: 1g
            image: nginx
  `;
    expect(Decomposerize(compose)).toMatchInlineSnapshot(
        '"docker run -p 80:80 -v \\"/var/run/spac es/docker.sock:/tmp/spac es/docker.sock:ro\\" --restart always --log-opt max-size=1g nginx"',
    );
});

test('multiple args (https://github.com/magicmark/composerize/issues/9)', () => {
    const compose = `
    version: '3.3'
    services:
        youtrack:
            tty: true
            container_name: youtrack
            volumes:
                - '/data/youtrack/data/:/opt/youtrack/data/'
                - '/data/youtrack/backup/:/opt/youtrack/backup/'
            ports:
                - '80:80'
                - '3232:22351'
            image: uniplug/youtrack
  `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot(
        '"docker run -t --name youtrack -v /data/youtrack/data/:/opt/youtrack/data/ -v /data/youtrack/backup/:/opt/youtrack/backup/ -p 80:80 -p 3232:22351 uniplug/youtrack"',
    );
});

test('testing parsing of quotes (https://github.com/magicmark/composerize/issues/10)', () => {
    const compose = `
    version: '3.3'
    services:
        nginx:
            container_name: foobar
            image: nginx
  `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot('"docker run --name foobar nginx"');
});

test('ignoring comments in compose', () => {
    const compose = `
    # ignored options for 'nginx'
    # -z=machin
    # --unknown-long=truc
    version: '3.3'
    services:
        nginx:
            container_name: foobar
            image: nginx
  `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot('"docker run --name foobar nginx"');
});

test('with equal for argument values', () => {
    const compose = `
    # ignored options for 'nginx'
    # -z=machin
    # --unknown-long=truc
    version: '3.3'
    services:
        nginx:
            container_name: foobar
            volumes:
               - 'vol:/tmp'
            image: nginx
  `;

    expect(Decomposerize(compose, { 'arg-value-separator': '=' })).toMatchInlineSnapshot(
        '"docker run --name=foobar -v=vol:/tmp nginx"',
    );
});

test('with equal and long for argument values', () => {
    const compose = `
    # ignored options for 'nginx'
    # -z=machin
    # --unknown-long=truc
    version: '3.3'
    services:
        nginx:
            container_name: foobar
            volumes:
               - 'vol:/tmp'
            image: nginx
  `;

    expect(
        Decomposerize(compose, {
            rm: true,
            detach: true,
            'long-args': true,
            'arg-value-separator': '=',
        }),
    ).toMatchInlineSnapshot('"docker run --rm --detach --name=foobar --volume=vol:/tmp nginx"');
});

test('--rm -d', () => {
    const compose = `
    version: '3.3'
    services:
        ubuntu:
            image: ubuntu
  `;

    expect(
        Decomposerize(compose, {
            rm: true,
            detach: true,
        }),
    ).toMatchInlineSnapshot('"docker run --rm -d ubuntu"');
});

test('multiline (https://github.com/magicmark/composerize/issues/546)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            hello-world:
                volumes:
                    - 'vol:/tmp'
                image: hello-world
                command: '--parameter'
        volumes:
            vol:
    `,
            {
                multiline: true,
            },
        ),
    ).toMatchInlineSnapshot(`
"docker volume create vol
docker run -v vol:/tmp \\\\
	hello-world \\\\
	--parameter"
`);
});

test('multiline (https://github.com/magicmark/composerize/issues/120)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            kong:
                container_name: kong
                networks:
                    - kong-net
                environment:
                    - KONG_DATABASE=postgres
                    - KONG_PG_HOST=kong-database
                    - KONG_CASSANDRA_CONTACT_POINTS=kong-database
                    - KONG_PROXY_ACCESS_LOG=/dev/stdout
                    - KONG_ADMIN_ACCESS_LOG=/dev/stdout
                    - KONG_PROXY_ERROR_LOG=/dev/stderr
                    - KONG_ADMIN_ERROR_LOG=/dev/stderr
                    - 'KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl'
                ports:
                    - '8000:8000'
                    - '8443:8443'
                    - '8001:8001'
                    - '8444:8444'
                image: 'kong:latest'
        networks:
            kong-net:
                external:
                    name: kong-net
    `,
            {
                multiline: true,
                'long-args': false,
                'arg-value-separator': ' ',
            },
        ),
    ).toMatchInlineSnapshot(`
"docker network create kong-net
docker run --net kong-net \\\\
	--name kong \\\\
	-e KONG_DATABASE=postgres \\\\
	-e KONG_PG_HOST=kong-database \\\\
	-e KONG_CASSANDRA_CONTACT_POINTS=kong-database \\\\
	-e KONG_PROXY_ACCESS_LOG=/dev/stdout \\\\
	-e KONG_ADMIN_ACCESS_LOG=/dev/stdout \\\\
	-e KONG_PROXY_ERROR_LOG=/dev/stderr \\\\
	-e KONG_ADMIN_ERROR_LOG=/dev/stderr \\\\
	-e \\"KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl\\" \\\\
	-p 8000:8000 \\\\
	-p 8443:8443 \\\\
	-p 8001:8001 \\\\
	-p 8444:8444 \\\\
	kong:latest"
`);
});
