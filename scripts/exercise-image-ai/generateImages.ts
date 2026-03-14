import fs from "fs"
import path from "path"

const prompts = JSON.parse(
  fs.readFileSync("./data/prompts.json","utf8")
)

const outputDir = "./public/exercises"

if(!fs.existsSync(outputDir)){
  fs.mkdirSync(outputDir,{recursive:true})
}

function slug(name:string){
  return name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g,"-")
}

async function run(){

for(const item of prompts){

console.log("Generating image:",item.name)

/*
Aquí irá el motor de imágenes que quieras usar
Ejemplos posibles:

• Stable Diffusion local
• Replicate
• DALL-E
• Midjourney API
*/

}

}

run()