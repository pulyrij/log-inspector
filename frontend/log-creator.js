export default function createLogElement(vm) {
    const log = document.createElement('div');
    log.className = 'log';
    log.dataset.id = vm.id;

    const header = createHeader(vm);
    header.addEventListener('click', () => {
        toggleLayout(vm, layoutElement);
    })
    const layouts = renderLayouts(vm);

    log.appendChild(header);
    log.appendChild(layouts);

    return log;
}

function createHeader(vm) {
    const header = document.createElement('div');
    header.classList.add('log-header');

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

    layout.classList.add('layout', layoutVm.name);
    layout.dataset.name = layoutVm.name;

    const dateEl = layout.appendChild(document.createElement('time'));
    dateEl.dateTime = vm.datetime;
    dateEl.textContent = layoutVm.date;

    const moduleSpan = layout.appendChild(document.createElement('span'));
    moduleSpan.classList.add('module');
    moduleSpan.textContent = layoutVm.module;

    const typeSpan = layout.appendChild(document.createElement('span'));
    typeSpan.classList.add('type');
    typeSpan.textContent = vm.type;

    const levelSpan = layout.appendChild(document.createElement('span'));
    levelSpan.classList.add('level');
    levelSpan.textContent = vm.level;

    const hostnameSpan = layout.appendChild(document.createElement('span'));
    hostnameSpan.classList.add('hostname');
    hostnameSpan.textContent = layoutVm.hostname;

    const pidSpan = layout.appendChild(document.createElement('span'));
    pidSpan.classList.add('pid');
    pidSpan.textContent = layoutVm.pid;

    return layout;
}

function createContextLayout() {}
function createErrorLayout() {}
function createErrorCauseLayout() {}
function createStackTraceLayout() {}