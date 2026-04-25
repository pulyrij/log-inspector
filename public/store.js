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
        const result = [];

        for (const [id, vm] of this.store) {
            if (this.unprocessed.has(id)) {
                result.push(vm);
                this.unprocessed.delete(id);
            }
        }
        result.sort((a, b) => a.id - b.id);
        return result;
    }
}
const store = new Store();
export default store;