class Store {
    constructor() {
        this.store = new Map();
        this.unprocessed = new Set();
    }
    add(vm) {
        if (this.store.has(vm.id)) return false;
        
        this.store.set(vm.id, vm);
        this.unprocessed.add(vm.id);
        
        return true;
    }
    getPending() {
    if (!this.unprocessed.size) return [];

    const result = [];
    for (const id of this.unprocessed) {
        result.push(this.store.get(id));
    }
    this.unprocessed.clear();
    result.sort((a, b) => a.id - b.id);
    return result;
}
}
const store = new Store();
export default store;