import fs from "fs"
import OpenAI from "openai"

const client = new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

const prompts = JSON.parse(
fs.readFileSync("./data/prompts.json")
)

for(const item of prompts){

console.log("Generating",item.name)

const result = await client.images.generate({
model:"gpt-image-1",
prompt:item.prompt,
size:"1024x1024"
})

const image=result.data[0].b64_json

fs.writeFileSync(
`./public/exercises/${item.file}`,
Buffer.from(image,"base64")
)

}