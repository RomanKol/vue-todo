const storage = {
    get(key) {
        return JSON.parse(localStorage.getItem(key));
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
};

// Generate UUIDs
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

// Date header component
Vue.component('date-header', {
    template: `
        <header id="date-header" class='row mb'>
            <h1>{{ day }}</h1>
            <div class='column'>
                <h2>{{ month }}</h2>
                <h3>{{ year }}</h3>
            </div>
            <h3>{{ weekday }}</h3>
        </header>
    `,
    data() {
        const options = {
            day: 'numeric',
            month: 'short',
            weekday: 'long',
            year: 'numeric',
        };

        const date = new Date().toLocaleDateString('en', options);
        const dateData = date.replace(/,|\./g, '').split(' ');

        return {
            weekday: dateData[0],
            month: dateData[1],
            day: dateData[2],
            year: dateData[3],
        };
    },
});

// Todo input element component
Vue.component('todo-input', {
    props: {
        value: {
            type: String,
            default: '',
        },
    },
    template: `
        <div class='input-group'>
            <input type='text' placeholder='Add a new todo' ref='input' v-bind:value='value' @keyup.enter='add'>
            <button title="Add todo" @click='add'>
                <img src='img/add.svg'>
            </button>
        </div>
    `,
    methods: {
        add() {
            if (this.$refs.input.value !== '') {
                this.$emit('add', this.$refs.input.value);
                this.$refs.input.value = '';
            }
        },
    },
});

// Todo list item component
Vue.component('todo-item', {
    props: {
        title: String,
        id: String,
        later: {
            type: Boolean,
            default: false,
        },
    },
    template: `
        <li class='todo-item'>
            <p>{{ title }}</p>
            <button title="Delete todo" @click='$emit("remove")'>
                <img src='img/delete.svg'>
            </button>
            <button title="Pause todo" v-if='!later' @click='$emit("pause")'>
                <img src='img/pause.svg'>
            </button>
            <button title="Check todo" @click='$emit("check")'>
                <img src='img/checkmark.svg'>
            </button>
        </li>
    `,
});

// Todo app
const todos = new Vue({
    el: '#todos',
    data: {
        todos: [],
    },
    methods: {
        add(value) {
            this.todos.push({
                id: uuidv4(),
                date: Date.now(),
                title: value,
                later: false,
                done: false,
            });
        },
        pauseTodo(id) {
            const that = this.todos.find(todo => todo.id === id);
            that.later = !that.later;
        },
        deleteTodo(id) {
            this.todos.splice(this.todos.findIndex(todo => todo.id === id), 1);
        },
    },
    computed: {
        openTodos() {
            return this.todos.filter(todo => !todo.later && !todo.done);
        },
        closedTodos() {
            return this.todos.filter(todo => todo.done);
        },
        laterTodos() {
            return this.todos.filter(todo => !todo.done && todo.later);
        },
    },
    watch: {
        todos() {
            storage.set('todos', this.todos);
        },
    },
    created() {
        this.todos = storage.get('todos') || [];
    },
});
