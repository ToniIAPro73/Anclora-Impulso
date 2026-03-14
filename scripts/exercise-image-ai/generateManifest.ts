import fs from "fs"

const prompts=JSON.parse(
fs.readFileSync("./data/prompts.json","utf8")
)

function slug(name:string){

return name
.toLowerCase()
.replace(/[^a-z0-9]+/g,"-")
.replace(/(^-|-$)/g,"")

}

interface Prompt {
  id: string;
  name: string;
  prompt: string;
}

const manifest = (prompts as Prompt[]).map((p: Prompt) => ({

id:p.id,

name:p.name,

file:`${slug(p.name)}.png`

}))

fs.writeFileSync(
"./data/exercise-manifest.json",
JSON.stringify(manifest,null,2)
)

console.log("Manifest created:",manifest.length)