import { docConfig } from "src/routes/doc"
import { app } from "../src/routes"

const doc = app.getOpenAPIDocument(docConfig)

console.log(JSON.stringify(doc, null, 2))
