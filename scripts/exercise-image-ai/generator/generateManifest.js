import fs from "fs"
import {slugify} from "../utils/slugify.js"

const exercises = JSON.parse(
fs.readFileSync("./data/exercises.json")
)

const manifest = exercises.map(ex => {

return {

id:ex.id,

name:ex.name,

file:`${slugify(ex.name)}.png`

}

})

fs.writeFileSync(
"./data/exercise-manifest.json",
JSON.stringify(manifest,null,2)
)

console.log("Manifest generated:",manifest.length)