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
        container.appendChild(layoutElement);
    });

    return container;
}

function createLayoutsContainer() {
    const container = document.createElement('div');
    container.className = 'log-layouts';
    return container;
}

function createLayout(layoutvm, vm) {
    const layout = document.createElement('div');

    layout.className = 'layout';
    layout.dataset.name = layoutvm.name;

    if(!vm.ui.expendedLayouts[layout.name]) {
        layout.style.display = 'none';
    }

    layout.textContent = 
        `${layoutvm.date} | ${layoutvm.module} | ${layoutvm.level}`;
    
    return layout;
}