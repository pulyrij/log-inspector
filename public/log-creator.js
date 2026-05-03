export default function createLogElement(vm) {
    console.log(vm);
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
        const layoutElement = createLayout(layout, vm, container);
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
        'stack-trace': createErrorStack,
    }

function createLayout(layoutVm, vm, root) {
    const factory = layoutFactories[layoutVm.name];
    if (!factory) {
        console.error('Unknown layout:', layoutVm.name);
        return null;
    }
    return factory(layoutVm, vm, root);
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

function createErrorHeader(layoutVm, vm, root) {
    const errorHeader = document.createElement('div');
    errorHeader.classList.add('error-header', `severity-${layoutVm.severity}`);

    const errorName = document.createElement('span');
    errorName.classList.add('name');
    errorName.textContent = layoutVm.errorname;

    const at = document.createElement('span');
    at.classList.add('at');
    at.textContent = 'at';

    const errorTopFrame = document.createElement('span');
    errorTopFrame.classList.add('topframe');
    errorTopFrame.textContent = layoutVm.topframe;

    errorHeader.appendChild(errorName);
    errorHeader.appendChild(errorTopFrame);

    errorHeader.addEventListener('click', () => {
        toggleLayout(vm, 'error-meta', root);
    });

    return errorHeader;
}

function createErrorLayout(layoutVm, vm, root) {
    const errorHeader = createErrorHeader(layoutVm, vm, root);

    const layout = document.createElement('div');
    layout.classList.add('layout', 'error-meta', `severity-${layoutVm.severity}`);
    layout.dataset.name = 'error-meta';

    const errorMetaList = createErrorMetaList(layoutVm, vm, root);
    layout.appendChild(errorMetaList);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(errorHeader);
    fragment.appendChild(layout);

    return fragment;
}
function createErrorMetaList(layoutVm, vm, root) {
    const info = [
        {key: 'name', value: layoutVm.errorname},
        {key: 'message', value: layoutVm.message},
        {key: 'severity', value: layoutVm.severity},
        {key: 'stack', value: layoutVm.stack}
    ];
    const dl = document.createElement('dl');

    info.forEach(item => {
        dl.appendChild(createErrorMetaListItem(item, vm, root));
    });

    return dl;
}
function createErrorMetaListItem(item, vm, root) {
    const row = document.createElement('div');
    row.classList.add('error-meta-row', item.key);

    const key = document.createElement('dt');
    key.classList.add('error-meta-key');
    key.textContent = `${item.key}:`;

    const value = document.createElement('dd');
    value.classList.add('error-meta-value');
    value.textContent = item.value;

    row.appendChild(key);
    row.appendChild(value);

    if (key === 'stack') {
        row.addEventListener('click', () => {
            toggleLayout(vm, 'stack-trace', root)
        });
    }

    return row;
}

function createErrorStack(layoutVm) {
    const errorStack = document.createElement('div');
    errorStack.classList.add('error-stack');

    layoutVm.stack.forEach(frame => {
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