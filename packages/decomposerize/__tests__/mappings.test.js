/* eslint-env jest */

import Decomposerize from '../src';

test('--read-only', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    read_only: true
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'
      `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot('"docker run --read-only -p 80:80 foobar/baz:latest"');
});

test('--privileged true', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    privileged: true
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'
      `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot('"docker run --privileged -p 80:80 foobar/baz:latest"');
});

test('bool switch string', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    privileged: 'true'
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'
      `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot('"docker run --privileged -p 80:80 foobar/baz:latest"');
});

test('--privileged false', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    privileged: false
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'
      `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot('"docker run -p 80:80 foobar/baz:latest"');
});

test('--user', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    user: '99:100'
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'
      `;

    expect(Decomposerize(compose, { 'long-args': true })).toMatchInlineSnapshot(
        '"docker run --user 99:100 --publish 80:80 foobar/baz:latest"',
    );
});

test('--label', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    labels:
                        - test1=value
                        - test2=value
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'
      `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot(
        '"docker run -l test1=value -l test2=value -p 80:80 foobar/baz:latest"',
    );
});

test('--hostname --domainname', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    hostname: myHostName
                    domainname: example.org
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'
      `;

    expect(Decomposerize(compose, { 'long-args': true })).toMatchInlineSnapshot(
        '"docker run --hostname myHostName --domainname example.org --publish 80:80 foobar/baz:latest"',
    );
});

test('-h', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    hostname: myHostName
                    ports:
                        - '80:80'
                    image: 'foobar/baz:latest'
      `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot('"docker run -h myHostName -p 80:80 foobar/baz:latest"');
});

test('--network (https://github.com/magicmark/composerize/issues/25)', () => {
    const compose = `
            version: '3.3'
            services:
                pms-docker:
                    container_name: plex
                    network_mode: host
                    environment:
                        - TZ=<timezone>
                        - PLEX_CLAIM=<claimToken>
                    volumes:
                        - '<path/to/plex/database>:/config'
                        - '<path/to/transcode/temp>:/transcode'
                        - '<path/to/media>:/data'
                    image: plexinc/pms-docker
      `;
    expect(Decomposerize(compose)).toMatchInlineSnapshot(
        '"docker run --net host --name plex -e TZ=<timezone> -e PLEX_CLAIM=<claimToken> -v <path/to/plex/database>:/config -v <path/to/transcode/temp>:/transcode -v <path/to/media>:/data plexinc/pms-docker"',
    );
});

test('--pid ', () => {
    const compose = `
            version: '3.3'
            services:
                nginx:
                    ports:
                        - '80:80'
                    pid: host
                    container_name: webserver
                    image: 'nginx:latest'
      `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot(
        '"docker run -p 80:80 --pid host --name webserver nginx:latest"',
    );
});

test('--ulimit (https://github.com/magicmark/composerize/pull/262)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            nginx:
                ulimits:
                    as: 1024
                image: 'nginx:latest'
    `),
    ).toMatchInlineSnapshot('"docker run --ulimit as=1024 nginx:latest"');

    expect(
        Decomposerize(`
        version: '3.3'
        services:
            nginx:
                ulimits:
                    nproc: 3
                image: 'nginx:latest'
    `),
    ).toMatchInlineSnapshot('"docker run --ulimit nproc=3 nginx:latest"');

    expect(
        Decomposerize(`
        version: '3.3'
        services:
            nginx:
                ulimits:
                    nofile:
                        soft: 1023
                        hard: 1025
                image: 'nginx:latest'
    `),
    ).toMatchInlineSnapshot('"docker run --ulimit nofile=1023:1025 nginx:latest"');

    // @see https://docs.docker.com/compose/compose-file/#ulimits
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            nginx:
                ulimits:
                    nproc: 65535
                    nofile:
                        soft: 20000
                        hard: 40000
                image: 'nginx:latest'
    `),
    ).toMatchInlineSnapshot('"docker run --ulimit nproc=65535 --ulimit nofile=20000:40000 nginx:latest"');
});

test('-it image name (https://github.com/magicmark/composerize/issues/544)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ctfd:
                ports:
                    - '8000:8000'
                stdin_open: true
                tty: true
                image: ctfd/ctfd
    `),
    ).toMatchInlineSnapshot('"docker run -p 8000:8000 -i -t ctfd/ctfd"');
});

test('command name (https://github.com/magicmark/composerize/issues/549)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            tailscale:
                container_name: tailscaled
                volumes:
                    - '/var/lib:/var/lib'
                    - '/dev/net/tun:/dev/net/tun'
                network_mode: host
                privileged: true
                image: tailscale/tailscale
                command: tailscaled
    `,
        ),
    ).toMatchInlineSnapshot(
        '"docker run --net host --name tailscaled -v /var/lib:/var/lib -v /dev/net/tun:/dev/net/tun --privileged tailscale/tailscale tailscaled"',
    );
});

test('gpus all (https://github.com/magicmark/composerize/issues/550)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ai-art:
                stdin_open: true
                tty: true
                deploy:
                    resources:
                        reservations:
                            devices:
                                -
                                    driver: nvidia
                                    count: all
                                    capabilities:
                                        - gpu
                ports:
                    - '3000:3000'
                volumes:
                    - '/opt/ai-art:/data'
                image: overshard/ai-art
    `),
    ).toMatchInlineSnapshot('"docker run -i -t --gpus all -p 3000:3000 -v /opt/ai-art:/data overshard/ai-art"');
});

test('gpus 1 (https://github.com/magicmark/composerize/issues/550)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ai-art:
                stdin_open: true
                tty: true
                deploy:
                    resources:
                        reservations:
                            devices:
                                -
                                    driver: nvidia
                                    count: 1
                                    capabilities:
                                        - gpu
                ports:
                    - '3000:3000'
                volumes:
                    - '/opt/ai-art:/data'
                image: overshard/ai-art
    `),
    ).toMatchInlineSnapshot('"docker run -i -t --gpus 1 -p 3000:3000 -v /opt/ai-art:/data overshard/ai-art"');
});

test('command name (https://github.com/magicmark/composerize/issues/538)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            keycloak:
                ports:
                    - '8080:8080'
                environment:
                    - KEYCLOAK_ADMIN=admin
                    - KEYCLOAK_ADMIN_PASSWORD=admin
                image: 'quay.io/keycloak/keycloak:18.0.2'
                command: start-dev
    `,
        ),
    ).toMatchInlineSnapshot(
        '"docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:18.0.2 start-dev"',
    );
});

test('command args (https://github.com/magicmark/composerize/issues/484)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            opc-plc:
                stdin_open: true
                tty: true
                ports:
                    - '50000:50000'
                    - '8080:8080'
                container_name: opcplc
                image: 'mcr.microsoft.com/iotedge/opc-plc:latest'
                command: '--pn=50000 --autoaccept --nospikes --nodips --nopostrend --nonegtrend --nodatavalues --sph --sn=25 --sr=10 --st=uint --fn=5 --fr=1 --ft=uint'
    `,
            { rm: true },
        ),
    ).toMatchInlineSnapshot(
        '"docker run --rm -i -t -p 50000:50000 -p 8080:8080 --name opcplc mcr.microsoft.com/iotedge/opc-plc:latest --pn=50000 --autoaccept --nospikes --nodips --nopostrend --nonegtrend --nodatavalues --sph --sn=25 --sr=10 --st=uint --fn=5 --fr=1 --ft=uint"',
    );
});

test('basic image (https://github.com/magicmark/composerize/issues/542)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            ubuntu:
                image: ubuntu
    `,
            { detach: true },
        ),
    ).toMatchInlineSnapshot('"docker run -d ubuntu"');
});

test('volumes declaration (https://github.com/magicmark/composerize/issues/524)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            readymedia:
                restart: unless-stopped
                container_name: readymedia1
                network_mode: host
                volumes:
                    - '/my/video/path:/media'
                    - 'readymediacache:/cache'
                environment:
                    - VIDEO_DIR1=/media/my_video_files
                image: ypopovych/readymedia
        volumes:
            readymediacache:
    `,
        ),
    ).toMatchInlineSnapshot(
        `
"docker volume create readymediacache
docker run --net host --restart unless-stopped --name readymedia1 -v /my/video/path:/media -v readymediacache:/cache -e VIDEO_DIR1=/media/my_video_files ypopovych/readymedia"
`,
    );
});

test('tmpfs (https://github.com/magicmark/composerize/issues/536)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            check-mk-raw:
                stdin_open: true
                tty: true
                ports:
                    - '8080:5000'
                tmpfs: '/opt/omd/sites/cmk/tmp:uid=1000,gid=1000'
                volumes:
                    - /omd/sites
                    - '/etc/localtime:/etc/localtime:ro'
                container_name: monitoring
                restart: always
                image: 'checkmk/check-mk-raw:2.0.0-latest'
    `,
        ),
    ).toMatchInlineSnapshot(
        '"docker run -i -t -p 8080:5000 --tmpfs /opt/omd/sites/cmk/tmp:uid=1000,gid=1000 -v /omd/sites -v /etc/localtime:/etc/localtime:ro --name monitoring --restart always checkmk/check-mk-raw:2.0.0-latest"',
    );
});

test('mount type (https://github.com/magicmark/composerize/issues/412)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            nginx:
                volumes:
                    -
                        type: bind
                        source: ./logs
                        target: /usr/src/app/logs
                image: nginx
    `),
    ).toMatchInlineSnapshot('"docker run --mount type=bind,source=./logs,target=/usr/src/app/logs nginx"');
});

test('mount type multi (https://github.com/magicmark/composerize/issues/412)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            nginx:
                volumes:
                    -
                        type: bind
                        source: ./logs
                        target: /usr/src/app/logs
                    -
                        type: bind
                        source: ./data
                        target: /usr/src/app/data
                image: nginx
    `),
    ).toMatchInlineSnapshot(
        '"docker run --mount type=bind,source=./logs,target=/usr/src/app/logs --mount type=bind,source=./data,target=/usr/src/app/data nginx"',
    );
});

test('cgroup (https://github.com/magicmark/composerize/issues/561)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            systemd_test:
                cgroup_parent: docker.slice
                cgroup: private
                image: systemd_test
    `),
    ).toMatchInlineSnapshot('"docker run --cgroup-parent docker.slice --cgroupns private systemd_test"');
});

test('cpu/share, ip (https://github.com/magicmark/composerize/issues/545)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            postgis:
                restart: always
                ports:
                    - '5432:5432'
                networks:
                    postgres_net:
                        ipv4_address: 172.18.0.100
                container_name: postgres2
                deploy:
                    resources:
                        limits:
                            cpus: 3
                cpu_shares: 512
                logging:
                    driver:
                        - json-file
                    options:
                        max-size: 100m
                        max-file: 10
                volumes:
                    - '/srv/postgres:/var/lib/postgresql/data'
                image: postgis/postgis
        networks:
            postgres_net:
                external:
                    name: postgres_net
    `),
    ).toMatchInlineSnapshot(
        `
"docker network create postgres_net
docker run --net postgres_net --restart always -p 5432:5432 --ip 172.18.0.100 --name postgres2 --cpus 3 -c 512 --log-driver json-file --log-opt max-size=100m,max-file=10 -v /srv/postgres:/var/lib/postgresql/data postgis/postgis"
`,
    );
});

test('port', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            neo4j:
                container_name: testneo4j
                ports:
                    - '7474:7474'
                    - '7687:7687'
                volumes:
                    - '$HOME/neo4j/data:/data'
                    - '$HOME/neo4j/logs:/logs'
                    - '$HOME/neo4j/import:/var/lib/neo4j/import'
                    - '$HOME/neo4j/plugins:/plugins'
                environment:
                    - NEO4J_AUTH=neo4j/test
                image: 'neo4j:latest'
    `,
            { detach: true },
        ),
    ).toMatchInlineSnapshot(
        '"docker run -d --name testneo4j -p 7474:7474 -p 7687:7687 -v $HOME/neo4j/data:/data -v $HOME/neo4j/logs:/logs -v $HOME/neo4j/import:/var/lib/neo4j/import -v $HOME/neo4j/plugins:/plugins -e NEO4J_AUTH=neo4j/test neo4j:latest"',
    );
});

test('ip, mac, hostname, network (https://github.com/magicmark/composerize/issues/359)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            image:
                container_name: test
                restart: always
                networks:
                    homenet:
                        ipv4_address: 192.168.1.9
                        ipv6_address: xxxxx
                mac_address: '00:00:00:00:00:09'
                hostname: myhost
                volumes:
                    - '/import/settings:/settings'
                    - '/import/media:/media'
                ports:
                    - '8080:8080'
                environment:
                    - UID=1000
                    - GID=1000
                image: repo/image
        networks:
            homenet:
                external:
                    name: homenet
    `,
            { detach: true },
        ),
    ).toMatchInlineSnapshot(
        `
"docker network create homenet
docker run -d --net homenet --name test --restart always --ip6 xxxxx --ip 192.168.1.9 --mac-address 00:00:00:00:00:09 -h myhost -v /import/settings:/settings -v /import/media:/media -p 8080:8080 -e UID=1000 -e GID=1000 repo/image"
`,
    );
});

test('-w working_dir', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            sbt:
                tty: true
                stdin_open: true
                volumes:
                    - '~/.ivy2:/root/.ivy2'
                    - '~/.sbt:/root/.sbt'
                    - '$PWD:/app'
                working_dir: /app
                image: mozilla/sbt
                command: 'sbt shell'
    `),
    ).toMatchInlineSnapshot(
        '"docker run -t -i -v ~/.ivy2:/root/.ivy2 -v ~/.sbt:/root/.sbt -v $PWD:/app -w /app mozilla/sbt sbt shell"',
    );
});

test('private registry (https://github.com/magicmark/composerize/issues/15)', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            mongo:
                restart: always
                privileged: true
                container_name: jatdb
                ports:
                    - '27017:27017'
                    - '28017:28017'
                environment:
                    - MONGODB_PASS=somepass
                volumes:
                    - '~/jat/mongodata:/data/db'
                image: registry.cloud.local/js/mongo
    `),
    ).toMatchInlineSnapshot(
        '"docker run --restart always --privileged --name jatdb -p 27017:27017 -p 28017:28017 -e MONGODB_PASS=somepass -v ~/jat/mongodata:/data/db registry.cloud.local/js/mongo"',
    );
});

test('cap_add, cap_drop, pid, net, prviledged, device (https://github.com/magicmark/composerize/issues/30)', () => {
    expect(
        Decomposerize(
            `
        version: '3.3'
        services:
            node:
                container_name: storageos
                environment:
                    - HOSTNAME
                    - ADVERTISE_IP=xxx.xxx.xxx.xxx
                    - JOIN=xxxxxxxxxxxxxxxxx
                network_mode: host
                pid: host
                privileged: true
                cap_add:
                    - SYS_ADMIN
                cap_drop:
                    - XXX
                devices:
                    - /dev/fuse
                volumes:
                    - '/var/lib/storageos:/var/lib/storageos:rshared'
                    - '/run/docker/plugins:/run/docker/plugins'
                image: 'storageos/node:0.10.0'
                command: server
    `,
            { detach: true },
        ),
    ).toMatchInlineSnapshot(
        '"docker run -d --net host --name storageos -e HOSTNAME -e ADVERTISE_IP=xxx.xxx.xxx.xxx -e JOIN=xxxxxxxxxxxxxxxxx --pid host --privileged --cap-add SYS_ADMIN --cap-drop XXX --device /dev/fuse -v /var/lib/storageos:/var/lib/storageos:rshared -v /run/docker/plugins:/run/docker/plugins storageos/node:0.10.0 server"',
    );
});

test('publish-all (https://github.com/magicmark/composerize/issues/19)', () => {
    expect(
        Decomposerize(`
        # ignored options for 'frontail'
        # -P
        version: '3.3'
        services:
            frontail:
                volumes:
                    - '/var/log:/log'
                image: mthenw/frontail
                command: /log/syslog
            `),
    ).toMatchInlineSnapshot('"docker run -v /var/log:/log mthenw/frontail /log/syslog"');
});

test('storage-opt multi', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            fedora:
                storage_opt:
                    size: 120G
                    dummy: xxx
                image: fedora
            `),
    ).toMatchInlineSnapshot('"docker run --storage-opt size=120G,dummy=xxx fedora"');
});

test('storage-opt simple', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            fedora:
                storage_opt:
                    size: 120G
                image: fedora
            `),
    ).toMatchInlineSnapshot('"docker run --storage-opt size=120G fedora"');
});

test('--sysctl', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            someimage:
                sysctls:
                    - net.core.somaxconn=1024
                    - net.ipv4.tw_reuse=1
                image: someimage
            `),
    ).toMatchInlineSnapshot('"docker run --sysctl net.core.somaxconn=1024 --sysctl net.ipv4.tw_reuse=1 someimage"');
});

test('dns, link, add host', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            container:
                dns:
                    - 8.8.8.8
                    - 127.0.0.1
                dns_search:
                    - domain.com
                dns_opt:
                    - 'attempts:10'
                links:
                    - other_container
                extra_hosts:
                    - '2.example2.com:10.0.0.2'
                    - '3.example.com:10.0.0.3'
                image: my/container
            `),
    ).toMatchInlineSnapshot(
        '"docker run --dns 8.8.8.8 --dns 127.0.0.1 --dns-search domain.com --dns-opt attempts:10 --link other_container --add-host 2.example2.com:10.0.0.2 --add-host 3.example.com:10.0.0.3 my/container"',
    );
});

test('--env-file', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                env_file:
                    - ./env.list
                image: ubuntu
                command: bash
            `),
    ).toMatchInlineSnapshot('"docker run --env-file ./env.list ubuntu bash"');
});

test('--expose ', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                expose:
                    - 1500-1505
                    - 80
                image: ubuntu
            `),
    ).toMatchInlineSnapshot('"docker run --expose 1500-1505 --expose 80 ubuntu"');
});

test('--ipc --init --userns --uts -u --group-add --oom-kill-disable --oom-score-adj --stop-signal --stop-timeout', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                ipc: shareable
                init: true
                userns_mode: host
                uts: uuu
                user: user1
                group_add:
                    - 'groupX'
                oom_kill_disable: true
                oom_score_adj: xxx
                stop_signal: SIG_TERM
                stop_grace_period: 2s
                image: ubuntu
            `),
    ).toMatchInlineSnapshot(
        '"docker run --ipc shareable --init --userns host --uts uuu -u user1 --group-add groupX --oom-kill-disable --oom-score-adj xxx --stop-signal SIG_TERM --stop-timeout 2s ubuntu"',
    );
});

test('--label', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                labels:
                    - my-label
                    - com.example.foo=bar
                image: ubuntu
                command: bash
            `),
    ).toMatchInlineSnapshot('"docker run -l my-label -l com.example.foo=bar ubuntu bash"');
});

test('deploy limits', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                deploy:
                    resources:
                        limits:
                            cpus: 1.5
                            pids: 1500
                            memory: 15G
                        reservations:
                            memory: 12G
                shm_size: 15G
                memswap_limit: yyy
                mem_swappiness: zzz
                cpu_period: xxx
                cpu_quota: xxx
                cpu_rt_period: xxx
                cpu_rt_runtime: xxx
                volume_from:
                    - other2
                image: ubuntu
            `),
    ).toMatchInlineSnapshot(
        '"docker run --cpus 1.5 --memory-reservation 12G -m 15G --pids-limit 1500 --shm-size 15G --memory-swap yyy --memory-swappiness zzz --cpu-period xxx --cpu-quota xxx --cpu-rt-period xxx --cpu-rt-runtime xxx --volumes-from other2 ubuntu"',
    );
});

test('--pull --runtime --platform --isolation', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                pull_policy: always
                runtime: xxx
                platform: linux
                isolation: yyy
                image: ubuntu
            `),
    ).toMatchInlineSnapshot('"docker run --pull always --runtime xxx --platform linux --isolation yyy ubuntu"');
});

test('--network-alias --link-local-ip', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                networks:
                    reseau:
                        aliases:
                            - ubuntu_res
                        link_local_ips:
                            - 192.168.0.1
                image: ubuntu
        networks:
            reseau:
                external:
                    name: reseau
            `),
    ).toMatchInlineSnapshot(
        `
"docker network create reseau
docker run --net reseau --link-local-ip 192.168.0.1 --net-alias ubuntu_res ubuntu"
`,
    );
});

test('--entrypoint', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                entrypoint:
                    - /bin/bash
                healthcheck:
                    disable: true
                image: ubuntu
            `),
    ).toMatchInlineSnapshot('"docker run --entrypoint /bin/bash --no-healthcheck ubuntu"');
});

test('--security-opt', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            fedora:
                security_opt:
                    - 'label:level:s0:c100,c200'
                stdin_open: true
                tty: true
                image: fedora
                command: bash
            `),
    ).toMatchInlineSnapshot('"docker run --security-opt label:level:s0:c100,c200 -i -t fedora bash"');
});

test('blkio 1 device', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                stdin_open: true
                tty: true
                blkio_config:
                    weight: 16
                    weight_device:
                        -
                            path: /dev/sda
                            weight: 200
                    device_read_bps:
                        -
                            path: /dev/sda
                            rate: 1mb
                    device_read_iops:
                        -
                            path: /dev/sda
                            rate: 1000
                    device_write_bps:
                        -
                            path: /dev/sda
                            rate: 1mb
                    device_write_iops:
                        -
                            path: /dev/sda
                            rate: 1000
                image: ubuntu
            `),
    ).toMatchInlineSnapshot(
        '"docker run -i -t --blkio-weight 16 --blkio-weight-device /dev/sda:200 --device-read-bps /dev/sda:1mb --device-read-iops /dev/sda:1000 --device-write-bps /dev/sda:1mb --device-write-iops /dev/sda:1000 ubuntu"',
    );
});

test('blkio 2 device', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            ubuntu:
                stdin_open: true
                tty: true
                blkio_config:
                    weight: 16
                    weight_device:
                        -
                            path: /dev/sda
                            weight: 200
                        -
                            path: /dev/sdb
                            weight: 300
                    device_read_bps:
                        -
                            path: /dev/sda
                            rate: 1mb
                        -
                            path: /dev/sdb
                            rate: 2mb
                    device_read_iops:
                        -
                            path: /dev/sda
                            rate: 1000
                    device_write_bps:
                        -
                            path: /dev/sda
                            rate: 1mb
                    device_write_iops:
                        -
                            path: /dev/sda
                            rate: 1000
                image: ubuntu
            `),
    ).toMatchInlineSnapshot(
        '"docker run -i -t --blkio-weight 16 --blkio-weight-device /dev/sda:200 --blkio-weight-device /dev/sdb:300 --device-read-bps /dev/sda:1mb --device-read-bps /dev/sdb:2mb --device-read-iops /dev/sda:1000 --device-write-bps /dev/sda:1mb --device-write-iops /dev/sda:1000 ubuntu"',
    );
});

test('--device-cgroup-rule', () => {
    expect(
        Decomposerize(`
        version: '3.3'
        services:
            my-image:
                device_cgroup_rules:
                    - 'c 42:* rmw'
                container_name: my-container
                image: my-image
            `),
    ).toMatchInlineSnapshot('"docker run --device-cgroup-rule \\"c 42:* rmw\\" --name my-container my-image"');
});

test('--healthcheck-cmd ', () => {
    const compose = `
        version: '3.3'
        services:
            nginx:
                healthcheck:
                    test: healthcheck.sh
                    interval: 60s
                    timeout: 10s
                    start_period: 30s
                    retries: '2'
                image: 'nginx:latest'
      `;
    expect(Decomposerize(compose)).toMatchInlineSnapshot(
        '"docker run --health-cmd healthcheck.sh --health-interval 60s --health-retries 2 --health-start-period 30s --health-timeout 10s nginx:latest"',
    );
});

test('#40 (bug)', () => {
    const compose = `
    version: "3"

    volumes:
      polyfill-cache:
        driver: juicedata/juicefs
        driver_opts:
          name: polyfill-cache
          metaurl: postgres://postgres:\${META_PASSWORD}@meta-server:5432/juicefs
          storage: \${STORAGE_TYPE}
          bucket: \${BUCKET}
          access-key: \${ACCESS_KEY}
          secret-key: \${SECRET_KEY}
    
    networks:
      polyfiller:
    
    services:
      autoheal:
        image: willfarrell/autoheal:1.2.0
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
        restart: always
    
      meta-server:
        depends_on:
          - autoheal
        image: postgres
        environment:
          - POSTGRES_USER=postgres
          - POSTGRES_DB=juicefs
          - POSTGRES_PASSWORD=\${META_PASSWORD}
        volumes:
          - ./data:/var/lib/postgresql/data/
        networks:
          - polyfiller
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U postgres"]
          interval: 3s
          retries: 5
        labels:
          - autoheal=true
        restart: always
    
      api-service:
        depends_on:
          - autoheal
          - meta-server
        image: polyfiller/api-service
        environment:
          - NODE_ENV=production
        volumes:
          - polyfill-cache:/tmp/@wessberg/polyfiller
        networks:
          - polyfiller
        healthcheck:
          test: ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"]
          interval: 300000000s
          retries: 5
          start_period: 30s
        labels:
          - autoheal=true
        restart: always
        logging:
          driver: json-file
          options:
            max-size: 10m
    
      caddy:
        depends_on:
          - api-service
        image: caddy
        ports:
          - 80:80
          - 443:443
        networks:
          - polyfiller
        restart: always
        command: caddy reverse-proxy --from polyfiller.app --to api-service:3000
      `;
    expect(Decomposerize(compose)).toMatchInlineSnapshot(`
"docker network create polyfiller
docker volume create -d juicedata/juicefs -o name=polyfill-cache -o metaurl=postgres://postgres:\${META_PASSWORD}@meta-server:5432/juicefs -o storage=\${STORAGE_TYPE} -o bucket=\${BUCKET} -o access-key=\${ACCESS_KEY} -o secret-key=\${SECRET_KEY} polyfill-cache
docker run -v /var/run/docker.sock:/var/run/docker.sock --restart always willfarrell/autoheal:1.2.0
docker run --net polyfiller -e POSTGRES_USER=postgres -e POSTGRES_DB=juicefs -e POSTGRES_PASSWORD=\${META_PASSWORD} -v ./data:/var/lib/postgresql/data/ --health-cmd \\"CMD-SHELL,pg_isready -U postgres\\" --health-interval 3s --health-retries 5 -l autoheal=true --restart always postgres
docker run --net polyfiller -e NODE_ENV=production -v polyfill-cache:/tmp/@wessberg/polyfiller --health-cmd \\"CMD-SHELL,curl -f http://localhost:3000/ || exit 1\\" --health-interval 300000000s --health-retries 5 --health-start-period 30s -l autoheal=true --restart always --log-driver json-file --log-opt max-size=10m polyfiller/api-service
docker run --net polyfiller -p 80:80 -p 443:443 --restart always caddy caddy reverse-proxy --from polyfiller.app --to api-service:3000"
`);
});

test('#40 (enhancements)', () => {
    const compose = `
    version: "3"

    volumes:
      polyfill-cache:
        driver: juicedata/juicefs
        driver_opts:
          name: polyfill-cache
          metaurl: postgres://postgres:\${META_PASSWORD}@meta-server:5432/juicefs
          storage: \${STORAGE_TYPE}
          bucket: \${BUCKET}
          access-key: \${ACCESS_KEY}
          secret-key: \${SECRET_KEY}
    
    networks:
      polyfiller:
    
    services:
      autoheal:
        image: willfarrell/autoheal:1.2.0
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
        restart: always
    
      meta-server:
        depends_on:
          - autoheal
        image: postgres
        environment:
          - POSTGRES_USER=postgres
          - POSTGRES_DB=juicefs
          - POSTGRES_PASSWORD=\${META_PASSWORD}
        volumes:
          - ./data:/var/lib/postgresql/data/
        networks:
          - polyfiller
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U postgres"]
          interval: 3s
          retries: 5
        labels:
          - autoheal=true
        restart: always
    
      api-service:
        depends_on:
          - autoheal
          - meta-server
        image: polyfiller/api-service
        environment:
          - NODE_ENV=production
        volumes:
          - polyfill-cache:/tmp/@wessberg/polyfiller
        networks:
          - polyfiller
        healthcheck:
          test: ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"]
          interval: 300000000s
          retries: 5
          start_period: 30s
        labels:
          - autoheal=true
        restart: always
        logging:
          driver: json-file
          options:
            max-size: 10m
    
      caddy:
        depends_on:
          - api-service
        image: caddy
        ports:
          - 80:80
          - 443:443
        networks:
          - polyfiller
        restart: always
        command: caddy reverse-proxy --from polyfiller.app --to api-service:3000
      `;
    expect(Decomposerize(compose)).toMatchInlineSnapshot(`
"docker network create polyfiller
docker volume create -d juicedata/juicefs -o name=polyfill-cache -o metaurl=postgres://postgres:\${META_PASSWORD}@meta-server:5432/juicefs -o storage=\${STORAGE_TYPE} -o bucket=\${BUCKET} -o access-key=\${ACCESS_KEY} -o secret-key=\${SECRET_KEY} polyfill-cache
docker run -v /var/run/docker.sock:/var/run/docker.sock --restart always willfarrell/autoheal:1.2.0
docker run --net polyfiller -e POSTGRES_USER=postgres -e POSTGRES_DB=juicefs -e POSTGRES_PASSWORD=\${META_PASSWORD} -v ./data:/var/lib/postgresql/data/ --health-cmd \\"CMD-SHELL,pg_isready -U postgres\\" --health-interval 3s --health-retries 5 -l autoheal=true --restart always postgres
docker run --net polyfiller -e NODE_ENV=production -v polyfill-cache:/tmp/@wessberg/polyfiller --health-cmd \\"CMD-SHELL,curl -f http://localhost:3000/ || exit 1\\" --health-interval 300000000s --health-retries 5 --health-start-period 30s -l autoheal=true --restart always --log-driver json-file --log-opt max-size=10m polyfiller/api-service
docker run --net polyfiller -p 80:80 -p 443:443 --restart always caddy caddy reverse-proxy --from polyfiller.app --to api-service:3000"
`);
});

test('top level networks and volumes', () => {
    const compose = `
            version: '3.3'
            services:
                baz:
                    image: 'foobar/baz:latest'
            networks:
                mynet1:
                    ipam:
                        driver: default
                        config:
                            - subnet: 172.28.0.0/16
                              ip_range: 172.28.5.0/24
                              gateway: 172.28.5.254
                              aux_addresses:
                                host1: 172.28.1.5
                                host2: 172.28.1.6
                                host3: 172.28.1.7
                        options:
                            foo: bar
                            baz: "0"
                mynet2:
                    driver: default
                    attachable: true
                    enable_ipv6: true
                    internal: true
                    driver_opts:
                        foo: bar
                        baz: "0"
                    labels:
                        - "com.example.description=Financial transaction network"
                        - "com.example.department=Finance"
                        - "com.example.label-with-empty-value"                        
            volumes:
                example:
                    driver: foobar
                    driver_opts:
                        type: "nfs"
                        o: "addr=10.40.0.199,nolock,soft,rw"
                        device: ":/docker/example"
                db-data:
                    labels:
                        com.example.description: "Database volume"
                        com.example.department: "IT/Ops"
                        com.example.label-with-empty-value: ""                        
      `;

    expect(Decomposerize(compose)).toMatchInlineSnapshot(`
"docker network create -d default -o foo=bar -o baz=0 --subnet 172.28.0.0/16 --ip-range 172.28.5.0/24 --gateway 172.28.5.254 --aux-address host1=172.28.1.5 --aux-address host2=172.28.1.6 --aux-address host3=172.28.1.7 mynet1
docker network create -d default --attachable --ipv6 --internal -o foo=bar -o baz=0 --label 0=com.example.description=Financial transaction network --label 1=com.example.department=Finance --label 2=com.example.label-with-empty-value mynet2
docker volume create -d foobar -o type=nfs -o o=addr=10.40.0.199,nolock,soft,rw -o device=:/docker/example example
docker volume create --label com.example.description=Database volume --label com.example.department=IT/Ops --label com.example.label-with-empty-value= db-data
docker run foobar/baz:latest"
`);
});
