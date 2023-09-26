// @flow

// Define the "types" of data a docker cli flag can represent in yaml.
export type ArgType =
    // Used for lists of things
    // e.g. --device (https://docs.docker.com/compose/compose-file/#devices)
    | 'Array'

    // Used to store a "limits" value of the input format: <type>=<soft limit>[:<hard limit>]
    // e.g. --ulimit
    // @see https://docs.docker.com/compose/compose-file/#ulimits
    // @see https://docs.docker.com/engine/reference/commandline/run/#set-ulimits-in-container---ulimit
    | 'Ulimits'

    // Used to store a boolean value for an option
    // e.g. --privileged (https://docs.docker.com/compose/compose-file/#domainname-hostname-ipc-mac_address-privileged-read_only-shm_size-stdin_open-tty-user-working_dir)
    | 'Switch'

    // Used to store an arbitrary text value for an option
    | 'Value'
    | 'IntValue'
    | 'FloatValue'
    | 'DeviceBlockIOConfigRate'
    | 'DeviceBlockIOConfigWeight'
    | 'MapArray'
    | 'Map'
    | 'Gpus';

// Type to represent the structure of the docker compose mapping
export type Mapping = {
    type: ArgType,
    path: string,
};

export const getMapping = (type: ArgType, path: string): Mapping => ({
    type,
    path,
});

// docker cli -> docker-compose options
export const MAPPINGS: { [string]: Mapping } = {
    'add-host': getMapping('Array', 'extra_hosts'),
    'blkio-weight': getMapping('IntValue', 'blkio_config/weight'),
    'blkio-weight-device': getMapping('DeviceBlockIOConfigWeight', 'blkio_config/weight_device'),
    'cap-add': getMapping('Array', 'cap_add'),
    'cap-drop': getMapping('Array', 'cap_drop'),
    'cgroup-parent': getMapping('Value', 'cgroup_parent'),
    cgroupns: getMapping('Value', 'cgroup'),
    'cpu-period': getMapping('Value', 'cpu_period'),
    'cpu-quota': getMapping('Value', 'cpu_quota'),
    'cpu-rt-period': getMapping('Value', 'cpu_rt_period'),
    'cpu-rt-runtime': getMapping('Value', 'cpu_rt_runtime'),
    'cpu-shares/c': getMapping('IntValue', 'cpu_shares'),
    cpus: getMapping('FloatValue', 'deploy/resources/limits/cpus'),
    'detached/d': getMapping('Switch', ''),
    'device-cgroup-rule': getMapping('Array', 'device_cgroup_rules'),
    'device-read-bps': getMapping('DeviceBlockIOConfigRate', 'blkio_config/device_read_bps'),
    'device-read-iops': getMapping('DeviceBlockIOConfigRate', 'blkio_config/device_read_iops'),
    'device-write-bps': getMapping('DeviceBlockIOConfigRate', 'blkio_config/device_write_bps'),
    'device-write-iops': getMapping('DeviceBlockIOConfigRate', 'blkio_config/device_write_iops'),
    device: getMapping('Array', 'devices'),
    'dns-opt': getMapping('Array', 'dns_opt'),
    'dns-search': getMapping('Array', 'dns_search'),
    dns: getMapping('Array', 'dns'),
    domainname: getMapping('Value', 'domainname'),
    entrypoint: getMapping('Array', 'entrypoint'),
    'env-file': getMapping('Array', 'env_file'),
    'env/e': getMapping('Array', 'environment'),
    expose: getMapping('Array', 'expose'),
    gpus: getMapping('Value', 'deploy/resources/reservations/devices/:first:/count'),
    'group-add': getMapping('Array', 'group_add'),
    'health-cmd': getMapping('Value', 'healthcheck/test'),
    'health-interval': getMapping('Value', 'healthcheck/interval'),
    'health-retries': getMapping('Value', 'healthcheck/retries'),
    'health-start-period': getMapping('Value', 'healthcheck/start_period'),
    'health-timeout': getMapping('Value', 'healthcheck/timeout'),
    'hostname/h': getMapping('Value', 'hostname'),
    init: getMapping('Switch', 'init'),
    'interactive/i': getMapping('Switch', 'stdin_open'),
    ip6: getMapping('Value', 'networks/:first:/ipv6_address'),
    ip: getMapping('Value', 'networks/:first:/ipv4_address'),
    ipc: getMapping('Value', 'ipc'),
    isolation: getMapping('Value', 'isolation'),
    'label/l': getMapping('Array', 'labels'),
    'link-local-ip': getMapping('Array', 'networks/:first:/link_local_ips'),
    link: getMapping('Array', 'links'),
    'log-driver': getMapping('Array', 'logging/driver'),
    'log-opt': getMapping('Map', 'logging/options'),
    'mac-address': getMapping('Value', 'mac_address'),
    'memory-reservation': getMapping('Value', 'deploy/resources/reservations/memory'),
    'memory-swap': getMapping('Value', 'memswap_limit'),
    'memory-swappiness': getMapping('Value', 'mem_swappiness'),
    'memory/m': getMapping('Value', 'deploy/resources/limits/memory'),
    mount: getMapping('MapArray', 'volumes'),
    name: getMapping('Value', 'container_name'),
    // 'network/net': getMapping('Networks', ''), //handled by code
    'network-alias/net-alias': getMapping('Array', 'networks/:first:/aliases'),
    'no-healthcheck': getMapping('Switch', 'healthcheck/disable'),
    'oom-kill-disable': getMapping('Switch', 'oom_kill_disable'),
    'oom-score-adj': getMapping('Value', 'oom_score_adj'),
    pid: getMapping('Value', 'pid'),
    'pids-limit': getMapping('IntValue', 'deploy/resources/limits/pids'),
    platform: getMapping('Value', 'platform'),
    privileged: getMapping('Switch', 'privileged'),
    'publish/p': getMapping('Array', 'ports'),
    pull: getMapping('Value', 'pull_policy'),
    'read-only': getMapping('Switch', 'read_only'),
    restart: getMapping('Value', 'restart'),
    rm: getMapping('Switch', ''),
    runtime: getMapping('Value', 'runtime'),
    'security-opt': getMapping('Array', 'security_opt'),
    'shm-size': getMapping('Value', 'shm_size'),
    'stop-signal': getMapping('Value', 'stop_signal'),
    'stop-timeout': getMapping('Value', 'stop_grace_period'),
    'storage-opt': getMapping('Map', 'storage_opt'),
    sysctl: getMapping('Array', 'sysctls'),
    tmpfs: getMapping('Value', 'tmpfs'),
    'tty/t': getMapping('Switch', 'tty'),
    ulimit: getMapping('Ulimits', 'ulimits'),
    'user/u': getMapping('Value', 'user'),
    userns: getMapping('Value', 'userns_mode'),
    uts: getMapping('Value', 'uts'),
    'volume/v': getMapping('Array', 'volumes'),
    'volumes-from': getMapping('Array', 'volume_from'),
    'workdir/w': getMapping('Value', 'working_dir'),
};
