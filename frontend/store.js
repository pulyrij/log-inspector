class Store {
    constructor() {
        this.store = [];
        this.logSet = new Set();
    }
    add(vm) {
        if (!this.logSet.has(vm.id)) {
            this.store.push(vm);
            this.logSet.add(vm.id);
        }
    }
}
const store = new Store();
export default store;