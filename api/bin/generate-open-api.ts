import { app } from "../src/routes"

const doc = app.getOpenAPI31Document({
  openapi: "3.1.0",
  info: { title: "Activity Tracker API", version: "0.0.1" },
})

console.log(JSON.stringify(doc, null, 2))
