import { cn } from "@/lib/utils"

type ExerciseIllustrationProps = {
  name: string
  className?: string
  compact?: boolean
}

type Pose = {
  head: string
  body: string
  leftArm: string
  rightArm: string
  leftLeg: string
  rightLeg: string
  opacity?: number
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

function Arrow({
  d,
  className,
}: {
  d: string
  className?: string
}) {
  return <path d={d} strokeLinecap="round" strokeLinejoin="round" className={cn("fill-none stroke-[4]", className)} />
}

function PoseFigure({ pose, tone = "stroke-orange-500" }: { pose: Pose; tone?: string }) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round" className={cn("fill-none stroke-[5]", tone)} opacity={pose.opacity ?? 1}>
      <path d={pose.head} />
      <path d={pose.body} />
      <path d={pose.leftArm} />
      <path d={pose.rightArm} />
      <path d={pose.leftLeg} />
      <path d={pose.rightLeg} />
    </g>
  )
}

function Scene({ poses, arrows, label }: { poses: Pose[]; arrows: string[]; label: string }) {
  return (
    <svg viewBox="0 0 320 220" className="h-full w-full" role="img" aria-label={label}>
      <defs>
        <linearGradient id="exercise-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(251,146,60,0.22)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0.08)" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="304" height="204" rx="28" fill="url(#exercise-bg)" className="stroke stroke-orange-200/60 dark:stroke-orange-500/20" />
      <path d="M48 178h224" strokeLinecap="round" className="fill-none stroke-[4] stroke-slate-300/70 dark:stroke-slate-600/70" />
      {poses.map((pose, index) => (
        <PoseFigure
          key={index}
          pose={pose}
          tone={index === poses.length - 1 ? "stroke-orange-500 dark:stroke-orange-300" : "stroke-orange-300 dark:stroke-orange-700"}
        />
      ))}
      {arrows.map((arrow, index) => (
        <Arrow key={index} d={arrow} className="stroke-rose-500/90 dark:stroke-rose-300/90" />
      ))}
    </svg>
  )
}

const scenes: Record<string, { poses: Pose[]; arrows: string[] }> = {
  "push-ups": {
    poses: [
      {
        head: "M96 118a10 10 0 1 0 0.1 0",
        body: "M108 126 L150 136 L208 144",
        leftArm: "M132 132 L112 154",
        rightArm: "M146 136 L130 162",
        leftLeg: "M176 140 L196 160",
        rightLeg: "M188 142 L214 160",
        opacity: 0.35,
      },
      {
        head: "M96 90a10 10 0 1 0 0.1 0",
        body: "M108 98 L156 102 L214 108",
        leftArm: "M130 100 L112 126",
        rightArm: "M144 102 L130 130",
        leftLeg: "M178 104 L196 128",
        rightLeg: "M192 106 L216 128",
      },
    ],
    arrows: ["M72 82c0 20 0 34 0 54", "M68 128l4 8 4-8"],
  },
  squats: {
    poses: [
      {
        head: "M118 64a12 12 0 1 0 0.1 0",
        body: "M118 76 L118 118",
        leftArm: "M118 90 L94 106",
        rightArm: "M118 90 L142 106",
        leftLeg: "M118 118 L98 156",
        rightLeg: "M118 118 L138 156",
        opacity: 0.35,
      },
      {
        head: "M198 88a12 12 0 1 0 0.1 0",
        body: "M198 100 L198 132",
        leftArm: "M198 112 L168 124",
        rightArm: "M198 112 L228 124",
        leftLeg: "M198 132 L172 154 L150 154",
        rightLeg: "M198 132 L220 154 L240 154",
      },
    ],
    arrows: ["M156 54c28 12 40 34 38 68", "M186 118l8 2-4 8"],
  },
  lunges: {
    poses: [
      {
        head: "M116 70a12 12 0 1 0 0.1 0",
        body: "M116 82 L118 120",
        leftArm: "M118 94 L92 112",
        rightArm: "M118 94 L146 112",
        leftLeg: "M118 120 L90 154 L70 154",
        rightLeg: "M118 120 L140 150 L166 148",
        opacity: 0.35,
      },
      {
        head: "M210 78a12 12 0 1 0 0.1 0",
        body: "M210 90 L210 126",
        leftArm: "M210 100 L184 118",
        rightArm: "M210 100 L234 118",
        leftLeg: "M210 126 L182 152 L156 152",
        rightLeg: "M210 126 L232 142 L248 166",
      },
    ],
    arrows: ["M144 62c20 10 34 26 42 46", "M182 104l8 0-2 8"],
  },
  plank: {
    poses: [
      {
        head: "M88 96a10 10 0 1 0 0.1 0",
        body: "M100 104 L152 106 L220 106",
        leftArm: "M126 106 L112 142",
        rightArm: "M138 106 L126 142",
        leftLeg: "M190 106 L204 142",
        rightLeg: "M204 106 L222 142",
      },
    ],
    arrows: ["M84 64c18-8 40-10 58-6", "M142 58l-6 6 8 2"],
  },
  pullups: {
    poses: [
      {
        head: "M160 118a11 11 0 1 0 0.1 0",
        body: "M160 130 L160 164",
        leftArm: "M160 136 L134 110 L118 82",
        rightArm: "M160 136 L186 110 L202 82",
        leftLeg: "M160 164 L144 194",
        rightLeg: "M160 164 L176 194",
        opacity: 0.35,
      },
      {
        head: "M160 92a11 11 0 1 0 0.1 0",
        body: "M160 104 L160 138",
        leftArm: "M160 108 L138 84 L124 56",
        rightArm: "M160 108 L182 84 L196 56",
        leftLeg: "M160 138 L146 166",
        rightLeg: "M160 138 L174 166",
      },
    ],
    arrows: ["M108 154c10-26 12-52 10-86", "M118 76l0-8 8 4"],
  },
  deadlifts: {
    poses: [
      {
        head: "M108 72a11 11 0 1 0 0.1 0",
        body: "M118 82 L146 118",
        leftArm: "M130 98 L126 144",
        rightArm: "M142 112 L140 144",
        leftLeg: "M146 118 L128 156",
        rightLeg: "M146 118 L168 156",
        opacity: 0.35,
      },
      {
        head: "M214 64a11 11 0 1 0 0.1 0",
        body: "M214 76 L214 122",
        leftArm: "M214 94 L194 144",
        rightArm: "M214 94 L234 144",
        leftLeg: "M214 122 L198 156",
        rightLeg: "M214 122 L230 156",
      },
    ],
    arrows: ["M154 90c18-18 38-30 62-34", "M208 58l8 0-2 8", "M112 146h44", "M188 146h44"],
  },
  press: {
    poses: [
      {
        head: "M112 72a12 12 0 1 0 0.1 0",
        body: "M112 84 L112 126",
        leftArm: "M112 96 L94 82 L86 58",
        rightArm: "M112 96 L130 82 L138 58",
        leftLeg: "M112 126 L96 160",
        rightLeg: "M112 126 L128 160",
        opacity: 0.35,
      },
      {
        head: "M206 72a12 12 0 1 0 0.1 0",
        body: "M206 84 L206 126",
        leftArm: "M206 96 L186 64 L178 38",
        rightArm: "M206 96 L226 64 L234 38",
        leftLeg: "M206 126 L190 160",
        rightLeg: "M206 126 L222 160",
      },
    ],
    arrows: ["M158 110c20-14 30-34 30-64", "M184 56l8-2-2 8"],
  },
  cardio: {
    poses: [
      {
        head: "M106 76a11 11 0 1 0 0.1 0",
        body: "M116 86 L128 120",
        leftArm: "M122 98 L94 112",
        rightArm: "M124 98 L150 112",
        leftLeg: "M128 120 L110 150",
        rightLeg: "M128 120 L152 140",
        opacity: 0.35,
      },
      {
        head: "M204 70a11 11 0 1 0 0.1 0",
        body: "M214 80 L226 118",
        leftArm: "M220 92 L194 68",
        rightArm: "M222 92 L248 116",
        leftLeg: "M226 118 L206 150",
        rightLeg: "M226 118 L250 100",
      },
    ],
    arrows: ["M142 82c26 0 44 10 64 34", "M198 112l8 2-6 6"],
  },
}

function sceneForExercise(name: string) {
  const slug = slugify(name)

  if (slug.includes("push-up") || slug.includes("bench-press") || slug.includes("fly")) return scenes["push-ups"]
  if (slug.includes("squat")) return scenes.squats
  if (slug.includes("lunge")) return scenes.lunges
  if (slug.includes("plank") || slug.includes("mountain-climber") || slug.includes("leg-raise") || slug.includes("crunch")) return scenes.plank
  if (slug.includes("pull-up") || slug.includes("lat-pulldown") || slug.includes("dip")) return scenes.pullups
  if (slug.includes("deadlift") || slug.includes("row") || slug.includes("swing")) return scenes.deadlifts
  if (slug.includes("press") || slug.includes("raise") || slug.includes("curl")) return scenes.press
  return scenes.cardio
}

export function ExerciseIllustration({ name, className, compact = false }: ExerciseIllustrationProps) {
  const scene = sceneForExercise(name)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[24px] border border-orange-100/70 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.22),_transparent_48%),linear-gradient(145deg,_rgba(255,247,237,0.95),_rgba(255,255,255,0.9))] p-3 shadow-inner dark:border-orange-500/10 dark:bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_46%),linear-gradient(145deg,_rgba(15,23,42,0.92),_rgba(2,6,23,0.92))]",
        compact ? "h-48" : "h-72",
        className,
      )}
    >
      <Scene poses={scene.poses} arrows={scene.arrows} label={`Illustration for ${name}`} />
    </div>
  )
}
