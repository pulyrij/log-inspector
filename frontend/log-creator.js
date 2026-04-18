export default function createLogElement(vm) {
    const log = document.createElement('div');
    log.className = 'log';
    log.dataset.id = vm.id;

    const header = createHeader(vm);
    const layouts = renderLayouts(vm);
    header.addEventListener('click', () => {
        toggleLayout(vm, 'meta', log);
    })

    log.appendChild(header);
    log.appendChild(layouts);

    return log;
}

function createHeader(vm) {
    const header = document.createElement('div');
    header.classList.add('log-header', vm.type, vm.level);

    const timeEl = header.appendChild(document.createElement('time'));
    timeEl.dateTime = vm.header.datetime;
    timeEl.textContent = vm.header.time;

    const messageSpan = header.appendChild(document.createElement('span'));
    messageSpan.classList.add('message');
    messageSpan.textContent = vm.header.message;

    const serviceSpan = header.appendChild(document.createElement('span'));
    serviceSpan.classList.add('service');
    serviceSpan.textContent = vm.header.service;

    return header;
}

function toggleLayout(vm, name, root) {
    
    const expanded = vm.ui.expandedLayouts[name] ?? false;

    const next = !expanded;

    vm.ui.expandedLayouts[name] = next;

    const layout = root.querySelector(`.layout[data-name="${name}"]`);

    if (layout) {
        layout.hidden = !next;
    }
}
function renderLayouts(vm) {
    const container = createLayoutsContainer();

    vm.layouts.forEach(layout => {
        const layoutElement = createLayout(layout, vm);
        if (layoutElement) {
            layoutElement.hidden = !vm.ui.expandedLayouts[layout.name];

            container.appendChild(layoutElement);
        }
    });

    return container;
}

function createLayoutsContainer() {
    const container = document.createElement('div');
    container.className = 'log-layouts';
    return container;
}

const layoutFactories = {
        'meta': createMetaLayout,
        'context': createContextLayout,
        'error': createErrorLayout,
        'error-cause': createErrorCauseLayout,
        'stack-trace': createStackTraceLayout
    }

function createLayout(layoutVm, vm) {
    const factory = layoutFactories[layoutVm.name];

    if (!factory) {
        console.error('Unknown layout:', layoutVm.name);
        return null;
    }

    return factory(layoutVm, vm);
}
function createMetaLayout(layoutVm, vm) {
    const layout = document.createElement('div');

    layout.classList.add('layout', 'meta');
    layout.dataset.name = 'meta';

    const metaList = createMetaList(layoutVm, vm);

    layout.appendChild(metaList);

    return layout;
}
function createMetaList(layoutVm, vm) {
    const meta = [
        {key: 'type', value: vm.type},
        {key: 'level', value: vm.level},
        {key: 'time', value: vm.header.time},
        {key: 'date', value: layoutVm.date},
        {key: 'message', value: vm.header.message},
        {key: 'service', value: vm.header.service},
        {key: 'module', value: layoutVm.module},
        {key: 'hostname', value: layoutVm.hostname},
        {key: 'pid', value: layoutVm.pid}
    ];

    const dl = document.createElement('dl');

    meta.forEach(item => {
        dl.appendChild(createMetaItem(item, vm));
    });

    return dl;
}
function createMetaItem(item, vm) {
    const row = document.createElement('div');
    row.classList.add('meta-row');

    const key = document.createElement('dt');
    key.classList.add('meta-key');
    key.textContent = `${item.key}:`;

    const value = document.createElement('dd');
    if (item.key === 'date' || item.key === 'time') {
        const timeValue = value.appendChild(document.createElement('time'));
        timeValue.dateTime = vm.datetime;
        timeValue.textContent = item.value;
    } else {
        value.textContent = item.value;
    }
    value.classList.add('meta-value');

    row.appendChild(key);
    row.appendChild(value);

    return row;
}

function createContextLayout() {}
function createErrorLayout() {}
function createErrorCauseLayout() {}
function createStackTraceLayout() {}