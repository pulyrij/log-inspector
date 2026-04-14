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
    header.className = 'log-header';
    header.textContent = 
        `${vm.header.time} | ${vm.header.service} | ${vm.header.message}`;
    
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