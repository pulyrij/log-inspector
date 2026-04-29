export default function createLogElement(vm) {
    const log = document.createElement('div');
    log.className = 'log';
    log.dataset.id = vm.id;

    const header = createHeader(vm);
    const layouts = renderLayouts(vm);
    header.addEventListener('click', () => {
        toggleLayout(vm, 'meta', log);
    });

    

    log.appendChild(header);
    log.appendChild(layouts);

    const errorHeader = log.querySelector('.meta-row.error');
    errorHeader.addEventListener('click', () => {
        toggleLayout(vm, 'error', log);
    });
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
        layout.classList.toggle('expanded', next);
    }
}
function renderLayouts(vm) {
    const container = createLayoutsContainer();

    vm.layouts.forEach(layout => {
        const layoutElement = createLayout(layout, vm);
        if (layoutElement) {
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

    layout.classList.add('layout', 'meta', vm.type, vm.level);
    layout.dataset.name = 'meta';

    const metaList = createMetaList(layoutVm, vm);

    layout.appendChild(metaList);

    return layout;
}
function createMetaList(layoutVm, vm) {
    const meta = [
        {key: 'type', value: vm.type},
        {key: 'time', value: vm.header.time},
        {key: 'date', value: layoutVm.date},
        {key: 'message', value: vm.header.message},
        {key: 'service', value: vm.header.service},
        {key: 'module', value: layoutVm.module},
        {key: 'hostname', value: layoutVm.hostname},
        {key: 'pid', value: layoutVm.pid}
    ];
    if (vm.type === 'alert') {
        meta.splice(1, 0, { key: 'level', value: vm.level });
    }
    if (vm.type === 'error') {
        meta.push({ key: 'error', value: vm.errorname });
    }

    const dl = document.createElement('dl');

    meta.forEach(item => {
        dl.appendChild(createMetaItem(item, vm));
    });

    return dl;
}
function createMetaItem(item, vm) {
    const row = document.createElement('div');
    row.classList.add('meta-row', item.key);

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

function createErrorLayout(layoutVm) {
    const layout = document.createElement('div');

    console.log(layoutVm);
    layout.classList.add('layout', 'error-meta', `sevirity-${layoutVm.severity}`);
    layout.dataset.name = 'error';

    const errorInfo = createErrorInfo(layoutVm);

    layout.appendChild(errorInfo);

    return layout;
}

function createErrorInfo(layoutVm) {
    const info = [
        {key: 'message', value: layoutVm.message},
        {key: 'severity', value: layoutVm.severity}
    ];
    const dl = document.createElement('dl');

    info.forEach(item => {
        dl.appendChild(createErrorInfoItem(item));
    });

    return dl;
}
function createErrorInfoItem(item) {
    const row = document.createElement('div');
    row.classList.add('errorinfo-row');

    const key = document.createElement('dt');
    key.classList.add('errorinfo-key');
    key.textContent = `${item.key}:`;

    const value = document.createElement('dd');
    value.classList.add('errorinfo-value');
    value.textContent = item.value;

    row.appendChild(key);
    row.appendChild(value);

    return row;
}

function createErrorStack(stack) {
    const errorStack = document.createElement('div');
    errorStack.classList.add('error-stack');

    stack.forEach(frame => {
        const stackFrame = document.createElement('span');
        stackFrame.classList.add('stack-frame');
        stackFrame.textContent = frame;

        errorStack.appendChild(stackFrame);
    });

    return errorStack;
}
function createContextLayout() {}
function createErrorCauseLayout() {}
function createStackTraceLayout() {}