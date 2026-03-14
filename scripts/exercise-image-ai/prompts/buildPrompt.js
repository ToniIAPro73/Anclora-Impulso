import {CONFIG} from "../config/imageConfig.js"

export function buildPrompt(exercise,pose){

return `
Use the provided reference model image as the base human model.

Do not change:
face
hair
beard
body proportions
skin tone

Clothing:
${CONFIG.clothing}

Style:
${CONFIG.style}

Exercise: ${exercise.name}

Equipment: ${exercise.equipment}

Create a fitness instruction image.

LEFT: ${pose.start}

RIGHT: ${pose.end}

Full body visible.

Add labels START and END.
Add movement arrow.
`

}