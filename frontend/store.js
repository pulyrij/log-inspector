class State {
    constructor() {
        this.store = new Map();
        this.processed = new Set();
    }
    add(vm) {
        if (this.processed.has(vm.id)) return false;
        
        this.store.set(vm.id, vm);
        
        return true;
    }
    getPending() {
        const result = [];

        for (const [id, vm] of this.store) {
            if (!this.processed.has(id)) {
                result.push(vm);
                this.processed.add(id);
            }
        }
        result.sort((a, b) => a.id - b.id);
        return result;
    }
}
const state = new State();
export default state;