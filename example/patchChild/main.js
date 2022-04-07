import { createApp } from "../../lib/simple-vue.esm.js"

import { app } from "./app.js"

console.log(app)

createApp(app).mount(document.querySelector("#app"))